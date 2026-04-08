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


interface SideNavState {
    isAnimatedIn: boolean;
}


class SideNav extends Component<SideNavProps, SideNavState> {
    private static readonly SIDENAV_WIDTH: number = 280;
    private static readonly BLOCK_BACKGROUND: string = '#161b22';
    private static readonly REPO_URL: string = 'https://github.com/leoweyr/cf-worker-project-gallery';

    private _animationFrameId?: number;

    public constructor(properties: SideNavProps) {
        super(properties);

        this.state = {
            isAnimatedIn: false
        };
    }

    public componentDidMount(): void {
        this._animationFrameId = requestAnimationFrame((): void => {
            this.setState((previousState: SideNavState): SideNavState => ({
                ...previousState,
                isAnimatedIn: true
            }));
        });
    }

    public componentWillUnmount(): void {
        if (typeof this._animationFrameId === 'number') {
            cancelAnimationFrame(this._animationFrameId);
            this._animationFrameId = undefined;
        }
    }

    public render(): ReactNode {
        const { isOpen } = this.props;
        const { isAnimatedIn } = this.state;

        if (!isOpen) {
            return null;
        }

        return (
            <div style={this._getOverlayStyles()}>
                <div
                    style={this._getBackdropStyles(isAnimatedIn)}
                    onClick={this._handleBackdropClick}
                />

                <aside style={this._getSideNavStyles(isAnimatedIn)}>
                    {this._renderFirstArea()}
                    {this._renderSecondArea()}
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

    private _getBackdropStyles(isAnimatedIn: boolean): CSSProperties {
        return {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            cursor: 'pointer',
            opacity: isAnimatedIn ? 1 : 0,
            transition: 'opacity 0.2s ease-out'
        };
    }

    private _getSideNavStyles(isAnimatedIn: boolean): CSSProperties {
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
            flexDirection: 'column',
            transform: isAnimatedIn ? 'translateX(0)' : 'translateX(-100%)',
            opacity: isAnimatedIn ? 1 : 0,
            transition: 'transform 0.24s ease-out, opacity 0.24s ease-out'
        };
    }

    private _getFirstAreaStyles(): CSSProperties {
        return {
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            padding: '16px',
            gap: '12px'
        };
    }

    private _getIconTitleBlockStyles(): CSSProperties {
        return {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '16px',
            backgroundColor: SideNav.BLOCK_BACKGROUND,
            borderRadius: '8px'
        };
    }

    private _getIconStyles(): CSSProperties {
        return {
            width: '40px',
            height: '40px',
            minWidth: '40px',
            minHeight: '40px',
            borderRadius: '6px',
            objectFit: 'contain' as const
        };
    }

    private _getTitleStyles(): CSSProperties {
        return {
            color: '#f0f6fc',
            fontSize: '16px',
            fontWeight: 600,
            lineHeight: '1.4',
            letterSpacing: '-0.01em',
            wordBreak: 'break-word'
        };
    }

    private _getGitInfoBlockStyles(): CSSProperties {
        return {
            position: 'relative',
            zIndex: 1,
            padding: '12px 16px',
            backgroundColor: SideNav.BLOCK_BACKGROUND,
            borderRadius: '8px'
        };
    }

    private _renderFirstArea(): ReactNode {
        const { iconUrl, title, gitUrl } = this.props;

        return (
            <div style={this._getFirstAreaStyles()}>
                <div style={this._getIconTitleBlockStyles()}>
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
                            <span style={{ color: '#8b949e', fontSize: '18px' }}>📦</span>
                        </div>
                    )}

                    <span style={this._getTitleStyles()}>{title}</span>
                </div>

                {gitUrl && (
                    <div style={this._getGitInfoBlockStyles()}>
                        <GitHubInfo gitUrl={gitUrl} />
                    </div>
                )}
            </div>
        );
    }

    private _getSecondAreaStyles(): CSSProperties {
        return {
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            padding: '0 16px 16px 16px'
        };
    }

    private _getMenuScrollContainerStyles(): CSSProperties {
        return {
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            backgroundColor: SideNav.BLOCK_BACKGROUND,
            borderRadius: '8px'
        };
    }

    private _getMenuItemStyles(isLast: boolean): CSSProperties {
        return {
            display: 'block',
            padding: '14px 16px',
            color: '#8b949e',
            fontSize: '14px',
            fontWeight: 500,
            textDecoration: 'none',
            borderBottom: isLast ? 'none' : '1px solid #30363d',
            transition: 'background-color 0.15s ease, color 0.15s ease'
        };
    }

    private _renderSecondArea(): ReactNode {
        const { menuItems } = this.props;

        return (
            <div style={this._getSecondAreaStyles()}>
                <nav style={this._getMenuScrollContainerStyles()}>
                    {menuItems.map((item: MenuItem, index: number): ReactNode => {
                        const isLast: boolean = index === menuItems.length - 1;

                        return (
                            <a
                                key={item.identifier}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={this._getMenuItemStyles(isLast)}
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
                        );
                    })}
                </nav>

                {this._renderBadge()}
            </div>
        );
    }

    private _getBadgeContainerStyles(): CSSProperties {
        return {
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '16px',
            flexShrink: 0
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
