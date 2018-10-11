import * as React from 'react';
import fetch from 'isomorphic-fetch';
import {withAsyncData} from 'react-simple-async-data-loader';

const Stargazers = (props: {owner: string; repo: string; stargazers: number}) => (
    <>
        <h3>
            {props.owner}/{props.repo}
        </h3>
        <h5>{props.stargazers} stargazers!</h5>
    </>
);

const StargazerList = (props: {repos: Array<{owner: string; repo: string; stargazers: number}>}) =>
    props.repos.map(repo => <Stargazers {...repo} key={repo.owner + repo.repo} />);

async function getStargazers(repos: {owner: string; repo: string}[]) {
    return await Promise.all(
        repos.map(async repo => {
            console.log('fetching', repo)
            const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}`);
            const details = await response.json();
            console.log('got', repo)
            return {
                owner: repo.owner,
                repo: repo.repo,
                stargazers: details.stargazers_count,
            };
        })
    );
}

export default withAsyncData({
    key: 'Stargazers',
    propName: 'repos',
    loader: props => getStargazers(props.repos),
})(StargazerList);
