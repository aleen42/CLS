#include <svn_client.h>
#include <svn_cmdline.h>
#include <svn_auth.h>
#include <svn_ra.h>

typedef enum svn_crawler_option_t {
  svn_crawler_option_print_dirs = SVN_OPT_FIRST_LONGOPT_ID,
  svn_crawler_option_non_interactive
} svn_crawler_option_t;

const apr_getopt_option_t svn_crawler_options[] = {
	{"revision",         'r', TRUE, "revision to crawl"},
	{"print-dirs",        svn_crawler_option_print_dirs, FALSE, "print directories"},
	{"non-interactive",   svn_crawler_option_non_interactive, FALSE, "non-interactive mode"},
	{0,               0, 0, 0},
};

typedef struct svn_crawler_file_baton_t {
	const char* path;
	svn_boolean_t executable;
} svn_crawler_file_baton_t;

const char* zero_md5 = "00000000000000000000000000000000";

static svn_error_t *
set_target_revision(void *edit_baton,
					svn_revnum_t target_revision,
					apr_pool_t *pool) {
	return SVN_NO_ERROR;
}                                                                                                                                                                                                          

static svn_error_t *
open_root(void *edit_baton,
		  svn_revnum_t base_revision,
		  apr_pool_t *pool,
		  void **dir_baton) {
	(*dir_baton) = edit_baton;
	return SVN_NO_ERROR;
}                                                                                                                                                                                                          

static svn_error_t *
delete_entry(const char *path,
			 svn_revnum_t revision,
			 void *parent_baton,
			 apr_pool_t *pool) {
	return SVN_NO_ERROR;
}

static svn_error_t *
add_directory(const char *path,
			  void *parent_baton,
			  const char *copyfrom_path,
			  svn_revnum_t copyfrom_revision,
			  apr_pool_t *pool,
			  void **child_baton) {
	svn_boolean_t print_dirs = (parent_baton != NULL);
	if (print_dirs) { 
		fprintf(stdout, "040000 tree %s\t%s\n", zero_md5, path);
	}
	(*child_baton) = parent_baton;
	return SVN_NO_ERROR;
}

static svn_error_t *
open_directory(const char *path,
			   void *parent_baton,
			   svn_revnum_t base_revision,
			   apr_pool_t *pool,
			   void **child_baton) {
	return SVN_NO_ERROR;
}

static svn_error_t *
change_dir_prop(void *dir_baton,
				const char *name,
				const svn_string_t *value,
				apr_pool_t *pool) {
	return SVN_NO_ERROR;
}

static svn_error_t *
close_directory(void *dir_baton,
				apr_pool_t *pool) {
	return SVN_NO_ERROR;
}

static svn_error_t *
add_file(const char *path,
		 void *parent_baton,
		 const char *copyfrom_path,
		 svn_revnum_t copyfrom_revision,
		 apr_pool_t *pool,
		 void **file_baton) {
	
	svn_crawler_file_baton_t* baton = (svn_crawler_file_baton_t*)apr_palloc(pool, sizeof(svn_crawler_file_baton_t));
	baton->path = apr_pstrdup(pool, path);
	baton->executable = FALSE;
	
	(*file_baton) = baton;
	
	return SVN_NO_ERROR;
}

static svn_error_t *
open_file(const char *path,
		  void *parent_baton,
		  svn_revnum_t base_revision,
		  apr_pool_t *pool,
		  void **file_baton) {
	return SVN_NO_ERROR;
}

static svn_error_t *
apply_textdelta(void *file_baton,
				const char *base_checksum,
				apr_pool_t *pool,
				svn_txdelta_window_handler_t *handler,
				void **handler_baton) {
  return SVN_NO_ERROR;
}

static svn_error_t *
change_file_prop(void *file_baton,
				 const char *name,
				 const svn_string_t *value,
				 apr_pool_t *pool) {
	svn_crawler_file_baton_t* baton = (svn_crawler_file_baton_t*)file_baton;
	if (strcmp(name, "svn:executable") == 0) {
		baton->executable = TRUE;
	}
	
  return SVN_NO_ERROR;
}

static svn_error_t *
close_file(void *file_baton,
		   const char *text_checksum,
		   apr_pool_t *pool) {
	svn_crawler_file_baton_t* baton = (svn_crawler_file_baton_t*)file_baton;
	const char* mode = baton->executable ? "100755" : "100644";
	const char* path = baton->path;
	// fprintf(stdout, "%s blob %s\t%s\n", mode, text_checksum, path);
	fprintf(stdout, "%s\n", path);
	return SVN_NO_ERROR;
}

static svn_error_t *
close_edit(void *edit_baton,
		   apr_pool_t *pool) {
  return SVN_NO_ERROR;
}

svn_error_t* parse_command_line(const char** url, svn_revnum_t* revision, svn_boolean_t* print_dirs, svn_boolean_t* non_interactive, int argc, const char** argv, apr_pool_t* pool) {
	svn_revnum_t internal_revision = -1;
	const char* internal_url = NULL;
	svn_boolean_t internal_print_dirs = FALSE;
	svn_boolean_t internal_non_interactive = FALSE;
	
	apr_getopt_t *options;
	apr_status_t apr_err = apr_getopt_init(&options, pool, argc, argv);
	if (apr_err) {
		return svn_error_wrap_apr(apr_err, "Error initializing command line arguments");
	}
	options->interleave = TRUE; //process non-option arguments too
	
	while (TRUE) {
		int opt_id;
		const char *opt_arg;
		
		apr_err = apr_getopt_long(options, svn_crawler_options, &opt_id, &opt_arg);
		if (APR_STATUS_IS_EOF(apr_err)) {
			break;
		} else if (apr_err) {
			return svn_error_wrap_apr(apr_err, "Error parsing command line arguments");
		}
		
		switch (opt_id) {
			case 'r':
				internal_revision = SVN_STR_TO_REV(opt_arg);
				break;
			case svn_crawler_option_print_dirs:
				internal_print_dirs = TRUE;
				break;
			case svn_crawler_option_non_interactive:
				internal_non_interactive = TRUE;
				break;
			default:
				return svn_error_createf(SVN_ERR_CL_ARG_PARSING_ERROR, NULL, "Error parsing command line arguments: unknown option %s", opt_arg);
		}
	}
	
	if (options->argc - options->ind != 1) {
		return svn_error_create(SVN_ERR_CL_INSUFFICIENT_ARGS, NULL, "Error parsing command line arguments: invalid number of arguments");
	}
	
	if (options->ind < options->argc) {
		internal_url = options->argv[options->ind++];
	}
	
	(*revision) = internal_revision;
	(*url) = internal_url;
	(*print_dirs) = internal_print_dirs;
	
	return SVN_NO_ERROR;
}

svn_error_t* crawl(const char* url, svn_revnum_t revision, svn_boolean_t print_dirs, svn_boolean_t non_interactive, apr_pool_t* pool) {
	svn_error_t* err;
	
	svn_auth_baton_t *auth_baton;
	svn_ra_callbacks2_t* callbacks;
	SVN_ERR(svn_ra_create_callbacks(&callbacks, pool));
	
	apr_hash_t* config = NULL;
	err = svn_config_get_config(&config, NULL, pool);
	if (err) {
	  if (APR_STATUS_IS_EACCES(err->apr_err) || APR_STATUS_IS_ENOTDIR(err->apr_err)) {
		  svn_error_clear(err);
		} else {
			return err;
		}
	}
	
	SVN_ERR(svn_cmdline_create_auth_baton(&auth_baton,
										  non_interactive,
										  NULL, NULL, NULL,
										  FALSE, TRUE,
										  apr_hash_get(config, SVN_CONFIG_CATEGORY_CONFIG, APR_HASH_KEY_STRING),
										  NULL, NULL, pool));
	
	callbacks->auth_baton = auth_baton;

	svn_ra_session_t* session;
	SVN_ERR(svn_ra_open3(&session, url, NULL, callbacks, NULL, config, pool));
	
	const svn_ra_reporter3_t* status_reporter;
	void* reporter_baton;
	
	if (revision == SVN_INVALID_REVNUM) {
		SVN_ERR(svn_ra_get_latest_revnum(session, &revision, pool));
	}
	
	svn_delta_editor_t *editor = svn_delta_default_editor(pool);
	editor->set_target_revision = set_target_revision;
	editor->open_root = open_root;
	editor->add_directory = add_directory;
	editor->close_directory = close_directory;
	editor->add_file = add_file;
	editor->close_file = close_file;
	
	SVN_ERR(svn_ra_do_status2(session, &status_reporter, &reporter_baton, "",
							  revision, svn_depth_infinity, editor, print_dirs ? (void*)1 : NULL, pool));

	SVN_ERR(status_reporter->set_path(reporter_baton, "", revision, svn_depth_infinity, TRUE, NULL, pool));
	SVN_ERR(status_reporter->finish_report(reporter_baton, pool));
	
	return SVN_NO_ERROR;
}

void print_usage(const char* command_name) {
	fprintf(stderr, "Usage: %s <URL> [-r REV] [--print-dirs] [--non-interactive]\n", command_name);
}

int main(int argc, const char **argv) {
	apr_pool_t* pool;
	svn_error_t* err;
	
	const char* url;
	svn_revnum_t revision;
	svn_boolean_t print_dirs;
	svn_boolean_t non_interactive;
	
	if (svn_cmdline_init("svn-crawler", stderr) != EXIT_SUCCESS) {
		return EXIT_FAILURE;
	}
	
	apr_pool_initialize();
	apr_pool_create_ex(&pool, NULL, NULL, NULL);

	svn_ra_initialize(pool);
	
	err = parse_command_line(&url, &revision, &print_dirs, &non_interactive, argc, argv, pool);
	if (err != NULL) {
		fprintf(stderr, "[Error: %s\n]", err->message);
		print_usage(argv[0]);
		return EXIT_FAILURE;
	}

	err = crawl(url, SVN_INVALID_REVNUM, print_dirs, non_interactive, pool);
	if (err != NULL) {
		fprintf(stderr, "[Error: %s\n]", err->message);
		return EXIT_FAILURE;
	}

	apr_pool_destroy(pool);
	apr_pool_terminate();
	return 0;
}
