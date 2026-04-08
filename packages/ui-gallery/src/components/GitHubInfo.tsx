import { Component, type CSSProperties, type ReactNode } from 'react';

import type { GitHubInfoProperties } from './GitHubInfoProperties';
import type { GitHubInfoState } from './GitHubInfoState';


class GitHubInfo extends Component<GitHubInfoProperties, GitHubInfoState> {
    private static readonly GITHUB_ICON_SVG: string = `<svg viewBox="0 0 16 16" width="24" height="24" fill="#f0f6fc"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>`;
    private static readonly STAR_ICON_SVG: string = `<svg viewBox="0 0 16 16" width="12" height="12" fill="#8b949e"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>`;
    private static readonly FORK_ICON_SVG: string = `<svg viewBox="0 0 16 16" width="12" height="12" fill="#8b949e"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/></svg>`;

    constructor(properties: GitHubInfoProperties) {
        super(properties);

        this.state = {
            repoName: '',
            stars: 0,
            forks: 0,
            isLoading: true,
            hasError: false
        };
    }

    public componentDidMount(): void {
        this._fetchGitHubData();
    }

    public componentDidUpdate(previousProperties: GitHubInfoProperties): void {

        if (previousProperties.gitUrl !== this.props.gitUrl) {
            this._fetchGitHubData();
        }
    }

    public render(): ReactNode {
        const repositoryInfo: { owner: string; repo: string } | null = this._parseGitHubInfo();

        if (!repositoryInfo) {
            return null;
        }

        const displayedRepositoryName: string = this.state.repoName || `${repositoryInfo.owner}/${repositoryInfo.repo}`;

        return (
            <a
                href={this._getRepoUrl()}
                target="_blank"
                rel="noopener noreferrer"
                style={this._getContainerStyles()}
            >
                <div
                    style={this._getIconContainerStyles()}
                    dangerouslySetInnerHTML={{ __html: GitHubInfo.GITHUB_ICON_SVG }}
                />
                <div style={this._getInfoContainerStyles()}>
                    <span style={this._getRepoNameStyles()}>{displayedRepositoryName}</span>
                    <div style={this._getStatsContainerStyles()}>
                        <span style={this._getStatItemStyles()}>
                            <span
                                style={this._getStatIconStyles()}
                                dangerouslySetInnerHTML={{ __html: GitHubInfo.STAR_ICON_SVG }}
                            />
                            <span>{this._formatNumber(this.state.stars)}</span>
                        </span>
                        <span style={this._getStatItemStyles()}>
                            <span
                                style={this._getStatIconStyles()}
                                dangerouslySetInnerHTML={{ __html: GitHubInfo.FORK_ICON_SVG }}
                            />
                            <span>{this._formatNumber(this.state.forks)}</span>
                        </span>
                    </div>
                </div>
            </a>
        );
    }

    private _parseGitHubInfo(): { owner: string; repo: string } | null {
        const { gitUrl } = this.props;
        const trimmedGitUrl: string = gitUrl.trim();
        const normalizedGitUrl: string = /^https?:\/\//.test(trimmedGitUrl) ? trimmedGitUrl : `https://${trimmedGitUrl}`;

        try {
            const gitRepositoryUrl: URL = new URL(normalizedGitUrl);
            const gitRepositoryHost: string = gitRepositoryUrl.hostname.toLowerCase();

            if (!gitRepositoryHost.includes('github.com')) {
                return null;
            }

            const pathSegments: string[] = gitRepositoryUrl.pathname.split('/').filter(Boolean);

            if (pathSegments.length < 2) {
                return null;
            }

            return {
                owner: pathSegments[0],
                repo: pathSegments[1].replace(/\.git$/, '')
            };
        } catch {
            return null;
        }
    }

    private _getRepoUrl(): string {
        const info: { owner: string; repo: string } | null = this._parseGitHubInfo();

        if (!info) {
            return '';
        }

        return `https://github.com/${info.owner}/${info.repo}`;
    }

    private _resolveGitHubToken(): string {
        const githubToken: string | undefined = import.meta.env.UI_GALLERY_GITHUB_TOKEN;

        if (!githubToken) {
            return '';
        }

        return githubToken.trim();
    }

    private _createGitHubRequestHeaders(): Record<string, string> {
        const requestHeaders: Record<string, string> = {
            Accept: 'application/vnd.github.v3+json'
        };
        const githubToken: string = this._resolveGitHubToken();

        if (!githubToken) {
            return requestHeaders;
        }

        requestHeaders.Authorization = `Bearer ${githubToken}`;

        return requestHeaders;
    }

    private async _fetchGitHubData(): Promise<void> {
        const info: { owner: string; repo: string } | null = this._parseGitHubInfo();

        if (!info) {
            this.setState((previousState: Readonly<GitHubInfoState>): GitHubInfoState => ({
                ...previousState,
                repoName: '',
                stars: 0,
                forks: 0,
                hasError: true,
                isLoading: false
            }));

            return;
        }

        this.setState((previousState: Readonly<GitHubInfoState>): GitHubInfoState => ({
            ...previousState,
            repoName: `${info.owner}/${info.repo}`,
            stars: 0,
            forks: 0,
            hasError: false,
            isLoading: true
        }));

        try {
            const response: Response = await fetch(
                `https://api.github.com/repos/${info.owner}/${info.repo}`,
                {
                    headers: this._createGitHubRequestHeaders()
                }
            );

            if (!response.ok) {
                this.setState((previousState: Readonly<GitHubInfoState>): GitHubInfoState => ({
                    ...previousState,
                    hasError: true,
                    isLoading: false
                }));

                return;
            }

            const data: {
                name: string;
                full_name?: string;
                stargazers_count: number;
                forks_count: number;
            } = await response.json();

            this.setState({
                repoName: data.full_name || `${info.owner}/${data.name}`,
                stars: data.stargazers_count,
                forks: data.forks_count,
                isLoading: false,
                hasError: false
            });
        } catch {
            this.setState((previousState: Readonly<GitHubInfoState>): GitHubInfoState => ({
                ...previousState,
                hasError: true,
                isLoading: false
            }));
        }
    }

    private _formatNumber(number: number): string {
        if (number >= 1000) {
            return `${(number / 1000).toFixed(1)}k`;
        }

        return number.toString();
    }

    private _getContainerStyles(): CSSProperties {
        return {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '0',
            textDecoration: 'none',
            cursor: 'pointer'
        };
    }

    private _getIconContainerStyles(): CSSProperties {
        return {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        };
    }

    private _getInfoContainerStyles(): CSSProperties {
        return {
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
        };
    }

    private _getRepoNameStyles(): CSSProperties {
        return {
            color: '#f0f6fc',
            fontSize: '13px',
            fontWeight: 600,
            lineHeight: '1.2'
        };
    }

    private _getStatsContainerStyles(): CSSProperties {
        return {
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        };
    }

    private _getStatItemStyles(): CSSProperties {
        return {
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#8b949e',
            fontSize: '11px',
            lineHeight: '1'
        };
    }

    private _getStatIconStyles(): CSSProperties {
        return {
            display: 'flex',
            alignItems: 'center'
        };
    }
}


export default GitHubInfo;
