/**
 * node stats.js <gitlab_host> <gitlab_access_token> <project> <from_date> <to_date>
 * @example node stats.js gitlab.com xxx username/repo 2024-07-01 2024-10-01
 */

const [, , host, token, repo, start, end, targetPattern] = process.argv;
const base = `${host}/api/v4/projects/${encodeURIComponent(repo)}`;
const baseMr = `${base}/merge_requests`, baseRepo = `${base}/repository`;

const endDate = new Date(`${end} 00:00:00`);
const startDate = new Date(`${start} 00:00:00`);

// request in parallel with maximum 100 threads
let suspendIndex = 0;
const promiseStatus = []; // number of fulfilled promises
const promiseNumber = []; // number of promises
const MAX_PARALLEL_CONNECTION = 100, promises = Array(MAX_PARALLEL_CONNECTION).fill(Promise.resolve());
const doFetch = async url => {
    let index = promiseStatus.findIndex((fulfilled, i) => fulfilled === promiseNumber[i]);
    // try to schedule an available promise to avoid suspend
    index === -1 && (index = promiseNumber.length < MAX_PARALLEL_CONNECTION ? promiseNumber.length
        // try to schedule to next when full
        : ++suspendIndex % MAX_PARALLEL_CONNECTION);
    promiseNumber[index] = (promiseNumber[index] || 0) + 1;
    return (promises[index] = promises[index].then(() => fetch(`${url}${url.includes('?') ? '&' : '?'}access_token=${token}`)).then(f => f.json())).finally(() => {
        promiseStatus[index] = (promiseStatus[index] || 0) + 1
    });
};

const authors = {}, warnings = [];
const stat = ({additions, deletions, total}) =>
    `added lines: \x1b[32m${additions}\x1b[0m, removed lines: \x1b[31m${deletions}\x1b[0m, total lines: \x1b[34m${total}\x1b[0m`;
let done = 0;
await Promise.all((await loop(`${baseMr}?&updated_after=${startDate.toISOString()}`, ({merged_at, state, target_branch}) =>
    state !== 'closed'
    && (!targetPattern || new RegExp(targetPattern).test(target_branch))
    && (!merged_at || (new Date(merged_at) >= startDate)), 1
)).map(async ({iid : mrId, title}, i, arr) => {
        const {diff_refs : {base_sha : baseSha, start_sha : startSha, head_sha : headSha}} = await doFetch(`${baseMr}/${mrId}`);
        const warn = `[warn] The merge request (!${mrId}, ${host}/${repo}/-/merge_requests/${mrId} )`
        if (!headSha) warnings.push(`${warn} has missed head.`);
        const [from, to] = headSha && baseSha === startSha ? [baseSha, headSha] : await getFromHistory();
        if (!from) return void warnings.push(`${warn} has been skipped due to a unknown base.`);
        await Promise.all((await doFetch(`${baseRepo}/compare?from=${from}&to=${to}&straight=true`)).commits
            .filter(c => new Date(c.authored_date) >= startDate && new Date(c.authored_date) <= endDate)
            .map(async c => {
                const key = c.author_email;
                const commit = (await doFetch(`${baseRepo}/commits/${encodeURIComponent(c.id)}`));
                const mergeRequests = (authors[key] = authors[key] || {})['mr'] = authors[key]['mr'] || {};
                const mr = (mergeRequests[mrId] = mergeRequests[mrId] || {title : `${title} !${mrId}`, commits : []});
                mr.commits.push(`* ${c.title}\x1b[0m (${stat(commit.stats)})\x1b[33m`);
                authors[key]['name'] = (authors[key]['name'] || c.author_name);
                authors[key]['additions'] = (authors[key]['additions'] || 0) + commit.stats.additions;
                authors[key]['deletions'] = (authors[key]['deletions'] || 0) + commit.stats.deletions;
                authors[key]['total'] = (authors[key]['total'] || 0) + commit.stats.total;
                authors[key]['commits'] = (authors[key]['commits'] || 0) + 1;
            }));

        stdout(++done, arr.length);

        async function getFromHistory() {
            const versions = (await loop(`${baseMr}/${mrId}/versions`)).filter(v => v.state !== 'overflow');
            // cannot find the base target // TODO: how to?
            if (!versions[0]) return [];
            // find first collected head_commit_sha as the latest head
            const headSha = versions.find(v => v.head_commit_sha).head_commit_sha;
            // find last collected base_commit_sha as the oldest target
            return [versions.filter(v => v.head_commit_sha === headSha).at(-1).base_commit_sha, headSha];
        }
    }));

stdout();
Object.entries(authors).sort(([, a1], [, a2]) => a2.commits - a1.commits).map(([email, author]) =>
    console.log(`${stat(author)}, \x1b[34m${author.commits}\x1b[0m commits in total (author: \x1b[34m"${author.name}" <${email}>\x1b[0m)`
                + `, MR: \n \x1b[33m\n  ${Object.values(author.mr)
            .map(({title, commits}) => `${title}\n    ${commits.join('\n    ')}`).join('\n  ')}\x1b[0m\n`));

console.log(`\n\x1b[33m${warnings.join('\n')}\x1b[0m`);

function stdout(done, total) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(done != null ? `[${done} / ${total}] merge requests` : '');
}

async function loop(url, filterFn, record) {
    return (await (async (page, results) => {
        let result;
        while ((result = await doFetch(`${url}${url.includes('?') ? '&' : '?'}page=${(++page)}&per_page=100`)).length) {
            results.push(...result.filter(filterFn || (x => x)));
            record && stdout(0, results.length);
        }
        return results;
    })(0, []));
}
