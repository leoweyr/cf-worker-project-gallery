import { Component, type CSSProperties, type ReactNode } from 'react';

import { type MenuItem } from '../MenuItem';
import GitHubInfo from './GitHubInfo';


export interface SideNavProps {
    isOpen: boolean;
    iconUrl: string;
    title: string;
    gitUrl: string;
    menuItems: MenuItem[];
    onClose: () => void;
}


class SideNav extends Component<SideNavProps, {}> {
    private static readonly SIDENAV_WIDTH: number = 280;
    private static readonly REPO_URL: string = 'https://github.com/leoweyr/cf-worker-project-gallery';

    public render(): ReactNode {
        const { isOpen } = this.props;

        if (!isOpen) {
            return null;
        }

        return (
            <div style={this._getOverlayStyles()}>
                <div
                    style={this._getBackdropStyles()}
                    onClick={this._handleBackdropClick}
                />

                <aside style={this._getSideNavStyles()}>
                    <div style={this._getContentStyles()}>
                        {this._renderHeader()}
                        {this._renderGitHubInfo()}
                        {this._renderMenuItems()}
                        <div style={{ flex: 1 }} />
                        {this._renderBadge()}
                    </div>
                </aside>
            </div>
        );
    }

    private _handleBackdropClick: () => void = (): void => {
        const { onClose } = this.props;

        onClose();
    };

    private _getOverlayStyles(): CSSProperties {
        return {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2147483647,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif'
        };
    }

    private _getBackdropStyles(): CSSProperties {
        return {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            cursor: 'pointer'
        };
    }

    private _getSideNavStyles(): CSSProperties {
        return {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: `${SideNav.SIDENAV_WIDTH}px`,
            backgroundColor: '#0d1117',
            borderRight: '1px solid #30363d',
            boxShadow: '4px 0 24px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        };
    }

    private _getContentStyles(): CSSProperties {
        return {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '24px',
            boxSizing: 'border-box',
            overflowY: 'auto'
        };
    }

    private _getHeaderStyles(): CSSProperties {
        return {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
            paddingBottom: '24px',
            borderBottom: '1px solid #30363d'
        };
    }

    private _getIconStyles(): CSSProperties {
        return {
            width: '48px',
            height: '48px',
            minWidth: '48px',
            minHeight: '48px',
            borderRadius: '8px',
            objectFit: 'contain' as const
        };
    }

    private _getTitleStyles(): CSSProperties {
        return {
            color: '#f0f6fc',
            fontSize: '18px',
            fontWeight: 700,
            lineHeight: '1.3',
            letterSpacing: '-0.02em',
            wordBreak: 'break-word'
        };
    }

    private _renderHeader(): ReactNode {
        const { iconUrl, title } = this.props;

        return (
            <div style={this._getHeaderStyles()}>
                {iconUrl ? (
                    <img
                        src={iconUrl}
                        alt="Project Icon"
                        style={this._getIconStyles()}
                    />
                ) : (
                    <div style={{
                        ...this._getIconStyles(),
                        backgroundColor: '#21262d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span style={{ color: '#8b949e', fontSize: '20px' }}>📦</span>
                    </div>
                )}

                <span style={this._getTitleStyles()}>{title}</span>
            </div>
        );
    }

    private _getGitHubInfoSectionStyles(): CSSProperties {
        return {
            marginBottom: '24px',
            paddingBottom: '24px',
            borderBottom: '1px solid #30363d'
        };
    }

    private _renderGitHubInfo(): ReactNode {
        const { gitUrl } = this.props;

        if (!gitUrl) {
            return null;
        }

        return (
            <div style={this._getGitHubInfoSectionStyles()}>
                <GitHubInfo gitUrl={gitUrl} />
            </div>
        );
    }

    private _getMenuSectionStyles(): CSSProperties {
        return {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '24px'
        };
    }

    private _getMenuItemStyles(): CSSProperties {
        return {
            display: 'block',
            padding: '12px 16px',
            color: '#8b949e',
            fontSize: '14px',
            fontWeight: 500,
            textDecoration: 'none',
            borderRadius: '6px',
            transition: 'background-color 0.15s ease, color 0.15s ease'
        };
    }

    private _renderMenuItems(): ReactNode {
        const { menuItems } = this.props;

        if (menuItems.length === 0) {
            return null;
        }

        return (
            <nav style={this._getMenuSectionStyles()}>
                {menuItems.map((item: MenuItem): ReactNode => (
                    <a
                        key={item.identifier}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={this._getMenuItemStyles()}
                        onMouseEnter={(event: React.MouseEvent<HTMLAnchorElement>): void => {
                            event.currentTarget.style.backgroundColor = '#21262d';
                            event.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(event: React.MouseEvent<HTMLAnchorElement>): void => {
                            event.currentTarget.style.backgroundColor = 'transparent';
                            event.currentTarget.style.color = '#8b949e';
                        }}
                    >
                        {item.label}
                    </a>
                ))}
            </nav>
        );
    }

    private _getBadgeContainerStyles(): CSSProperties {
        return {
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '24px',
            borderTop: '1px solid #30363d'
        };
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
            <div style={this._getBadgeContainerStyles()}>
                <a
                    href={SideNav.REPO_URL}
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
                    <span style={this._getBadgeLineStyles(false)}>Injected Navigation Bar Powered by</span>
                    <span style={this._getBadgeLineStyles(true)}>cf-worker-project-gallery</span>
                </a>
            </div>
        );
    }
}


export default SideNav;
