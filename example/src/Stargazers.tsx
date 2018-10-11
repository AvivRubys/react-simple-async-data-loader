import * as React from 'react';
import fetch from 'isomorphic-fetch';
import {AsyncLoader, LoadingStage} from 'react-simple-async-data-loader';

const Stargazers = (props: {repoName: string; stargazers?: number}) => (
    <>
        <h3>{props.repoName}</h3>
        {typeof props.stargazers !== 'undefined' && <h5>{props.stargazers}&nbsp;stargazers!</h5>}
    </>
);

interface StargazerListProps {
    repos: Array<{owner: string; repo: string}>;
}

const StargazerList = (props: StargazerListProps) => (
    <AsyncLoader dataKey="stargazers" loader={() => getStargazers(props.repos)}>
        {result => {
            switch (result.state) {
                case LoadingStage.Pending:
                    return <span>Loading...</span>;
                case LoadingStage.Success:
                    return props.repos.map((repo, i) => (
                        <Stargazers
                            repoName={repo.owner + '/' + repo.repo}
                            stargazers={result.result[i]}
                            key={i.toString()}
                        />
                    ));
                case LoadingStage.Failure:
                    return <span>OH NOOOO</span>;
            }
        }}
    </AsyncLoader>
);

async function getStargazers(repos: StargazerListProps['repos']) {
    return await Promise.all(
        repos.map(async repo => {
            const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}`);
            const details = await response.json();

            return details.stargazers_count as number;
        })
    );
}

export default StargazerList;
