import { Component, type CSSProperties, type ReactNode } from 'react';

import GitHubInfo from './GitHubInfo';


export interface GlobalNavProps {
    iconUrl: string;
    title: string;
    gitUrl: string;
}


class GlobalNav extends Component<GlobalNavProps, {}> {
    private static readonly NAV_HEIGHT: number = 64;
    private static readonly ICON_TITLE_SPACING: number = 16;
    private static readonly EDGE_PADDING: number = 24;
    private static readonly GIT_INFO_BADGE_SPACING: number = 16;
    private static readonly REPO_URL: string = 'https://github.com/leoweyr/cf-worker-project-gallery';

    public render(): ReactNode {
        return (
            <nav style={this._getNavStyles()}>
                <div style={this._getContainerStyles()}>
                    {this._renderIcon()}
                    {this._renderTitle()}
                    <div style={{ flex: 1 }} />
                    {this._renderGitHubInfo()}
                    {this._renderBadge()}
                </div>
            </nav>
        );
    }

    private _getNavStyles(): CSSProperties {
        return {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: `${GlobalNav.NAV_HEIGHT}px`,
            backgroundColor: '#0d1117',
            borderBottom: '1px solid #30363d',
            zIndex: 2147483647,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif'
        };
    }

    private _getContainerStyles(): CSSProperties {
        return {
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            padding: `0 ${GlobalNav.EDGE_PADDING}px`
        };
    }

    private _getIconStyles(): CSSProperties {
        return {
            width: '32px',
            height: '32px',
            minWidth: '32px',
            minHeight: '32px',
            marginRight: `${GlobalNav.ICON_TITLE_SPACING}px`,
            borderRadius: '6px',
            objectFit: 'contain' as const
        };
    }

    private _getTitleStyles(): CSSProperties {
        return {
            display: 'flex',
            alignItems: 'center',
            color: '#f0f6fc',
            fontSize: '20px',
            fontWeight: 700,
            lineHeight: '32px',
            letterSpacing: '-0.02em'
        };
    }

    private _renderIcon(): ReactNode {
        const { iconUrl } = this.props;

        if (!iconUrl) {
            return (
                <div style={{
                    ...this._getIconStyles(),
                    backgroundColor: '#21262d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <span style={{ color: '#8b949e', fontSize: '14px' }}>📦</span>
                </div>
            );
        }

        return (
            <img
                src={iconUrl}
                alt="Project Icon"
                style={this._getIconStyles()}
            />
        );
    }

    private _renderTitle(): ReactNode {
        const { title } = this.props;

        return (
            <span style={this._getTitleStyles()}>{title}</span>
        );
    }

    private _getBadgeStyles(): CSSProperties {
        return {
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '6px 12px',
            backgroundColor: '#ffffff',
            border: '2px solid #000000',
            borderRadius: '4px',
            textDecoration: 'none',
            transform: 'rotate(-2deg)',
            boxShadow: '2px 2px 0px #000000',
            cursor: 'pointer',
            transition: 'transform 0.1s ease'
        };
    }

    private _getBadgeLineStyles(isSecondLine: boolean): CSSProperties {
        return {
            color: '#000000',
            fontSize: isSecondLine ? '10px' : '8px',
            fontWeight: isSecondLine ? 700 : 400,
            lineHeight: '1.2',
            letterSpacing: '0.02em',
            textTransform: 'uppercase' as const,
            whiteSpace: 'nowrap' as const
        };
    }

    private _renderBadge(): ReactNode {
        return (
            <a
                href={GlobalNav.REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={this._getBadgeStyles()}
                onMouseEnter={(event: React.MouseEvent<HTMLAnchorElement>): void => {
                    event.currentTarget.style.transform = 'rotate(0deg) scale(1.05)';
                }}
                onMouseLeave={(event: React.MouseEvent<HTMLAnchorElement>): void => {
                    event.currentTarget.style.transform = 'rotate(-2deg)';
                }}
            >
                <span style={this._getBadgeLineStyles(false)}>Injected Top Navigation Bar Powered by</span>
                <span style={this._getBadgeLineStyles(true)}>cf-worker-project-gallery</span>
            </a>
        );
    }

    private _renderGitHubInfo(): ReactNode {
        const { gitUrl } = this.props;

        if (!gitUrl) {
            return null;
        }

        return (
            <div style={{ marginRight: `${GlobalNav.GIT_INFO_BADGE_SPACING}px` }}>
                <GitHubInfo gitUrl={gitUrl} />
            </div>
        );
    }
}


export default GlobalNav;
