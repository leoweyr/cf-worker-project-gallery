import { Component, createRef, type CSSProperties, type ReactNode, type RefObject } from 'react';

import { type MenuItem } from '../MenuItem';
import GitHubInfo from './GitHubInfo';
import NavMenu from './NavMenu';
import SideNav from './SideNav';


export interface GlobalNavProps {
    iconUrl: string;
    title: string;
    gitUrl: string;
    menuItems: MenuItem[];
}


interface GlobalNavState {
    menuAvailableWidth: number;
    isMobileView: boolean;
    isSideNavOpen: boolean;
}


class GlobalNav extends Component<GlobalNavProps, GlobalNavState> {
    private static readonly NAV_HEIGHT: number = 64;
    private static readonly ICON_TITLE_SPACING: number = 16;
    private static readonly EDGE_PADDING: number = 24;
    private static readonly GIT_INFO_BADGE_SPACING: number = 16;
    private static readonly TITLE_MENU_SPACING: number = 128;
    private static readonly MENU_RIGHT_BOUNDARY_SPACING: number = 128;
    private static readonly REPO_URL: string = 'https://github.com/leoweyr/cf-worker-project-gallery';
    private static readonly HAMBURGER_ICON_SVG: string = `<svg viewBox="0 0 24 24" width="24" height="24" fill="#f0f6fc"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>`;

    private _leftSectionRef: RefObject<HTMLDivElement | null> = createRef<HTMLDivElement>();
    private _rightSectionRef: RefObject<HTMLDivElement | null> = createRef<HTMLDivElement>();
    private _isMobileView: boolean = false;
    private _desktopMinWidth: number = 0;

    public constructor(properties: GlobalNavProps) {
        super(properties);

        this.state = {
            menuAvailableWidth: 0,
            isMobileView: false,
            isSideNavOpen: false
        };
    }

    public componentDidMount(): void {
        this._measureAndUpdateView();

        window.addEventListener('resize', this._handleResize);
    }

    public componentWillUnmount(): void {
        window.removeEventListener('resize', this._handleResize);
    }

    public render(): ReactNode {
        const { iconUrl, title, gitUrl, menuItems } = this.props;
        const { isMobileView, isSideNavOpen } = this.state;

        // When side nav is open, hide the top nav entirely.
        if (isSideNavOpen) {
            return (
                <SideNav
                    isOpen={true}
                    iconUrl={iconUrl}
                    title={title}
                    gitUrl={gitUrl}
                    menuItems={menuItems}
                    onClose={this._handleCloseSideNav}
                />
            );
        }

        if (isMobileView) {
            return this._renderMobileNav();
        }

        return this._renderDesktopNav();
    }

    private _renderMobileNav(): ReactNode {
        const { title } = this.props;

        return (
            <nav style={this._getNavStyles()}>
                <div style={this._getContainerStyles()}>
                    <button
                        type="button"
                        style={this._getHamburgerButtonStyles()}
                        onClick={this._handleOpenSideNav}
                    >
                        <span
                            style={this._getHamburgerIconStyles()}
                            dangerouslySetInnerHTML={{ __html: GlobalNav.HAMBURGER_ICON_SVG }}
                        />
                    </button>

                    <span style={this._getMobileTitleStyles()}>{title}</span>
                </div>
            </nav>
        );
    }

    private _renderDesktopNav(): ReactNode {
        const { menuAvailableWidth } = this.state;

        return (
            <nav style={this._getNavStyles()}>
                <div style={this._getContainerStyles()}>
                    <div
                        ref={this._leftSectionRef}
                        style={this._getLeftSectionStyles()}
                    >
                        {this._renderIcon()}
                        {this._renderTitle()}
                    </div>

                    <div style={this._getMenuSectionStyles()}>
                        {this._renderNavMenu(menuAvailableWidth)}
                    </div>

                    <div style={{ flex: 1 }} />

                    <div
                        ref={this._rightSectionRef}
                        style={this._getRightSectionStyles()}
                    >
                        {this._renderGitHubInfo()}
                        {this._renderBadge()}
                    </div>
                </div>
            </nav>
        );
    }

    private _handleOpenSideNav: () => void = (): void => {
        this._setContentFrameFullscreen(true);

        this.setState((previousState: GlobalNavState): GlobalNavState => ({
            ...previousState,
            isSideNavOpen: true
        }));
    };

    private _handleCloseSideNav: () => void = (): void => {
        this._setContentFrameFullscreen(false);

        // Reset mobile view state and re-measure after closing.
        this._isMobileView = false;

        this.setState((previousState: GlobalNavState): GlobalNavState => ({
            ...previousState,
            isSideNavOpen: false,
            isMobileView: false
        }), (): void => {
            // Re-measure after rendering desktop nav.
            this._measureAndUpdateView();
        });
    };

    private _setContentFrameFullscreen(fullscreen: boolean): void {
        const contentFrame: HTMLElement | null = document.getElementById('gallery-original-content');

        if (!contentFrame) {
            return;
        }

        if (fullscreen) {
            contentFrame.style.top = '0';
            contentFrame.style.height = '100vh';
            // Disable interaction with the content frame when sidebar is open.
            contentFrame.style.pointerEvents = 'none';
            contentFrame.setAttribute('tabindex', '-1');

            if (contentFrame instanceof HTMLIFrameElement) {
                contentFrame.blur();
            }
        } else {
            contentFrame.style.top = `${GlobalNav.NAV_HEIGHT}px`;
            contentFrame.style.height = `calc(100vh - ${GlobalNav.NAV_HEIGHT}px)`;
            // Re-enable interaction with the content frame.
            contentFrame.style.pointerEvents = 'auto';
            contentFrame.setAttribute('tabindex', '0');
        }
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

    private _getHamburgerButtonStyles(): CSSProperties {
        return {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            padding: 0,
            border: 'none',
            borderRadius: '6px',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease'
        };
    }

    private _getHamburgerIconStyles(): CSSProperties {
        return {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        };
    }

    private _getMobileTitleStyles(): CSSProperties {
        return {
            display: 'flex',
            alignItems: 'center',
            color: '#f0f6fc',
            fontSize: '18px',
            fontWeight: 700,
            marginLeft: '16px',
            lineHeight: '1.3',
            letterSpacing: '-0.02em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        };
    }

    private _getLeftSectionStyles(): CSSProperties {
        return {
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0
        };
    }

    private _getMenuSectionStyles(): CSSProperties {
        return {
            display: 'flex',
            alignItems: 'center',
            marginLeft: `${GlobalNav.TITLE_MENU_SPACING}px`,
            flexShrink: 1,
            overflow: 'visible'
        };
    }

    private _getRightSectionStyles(): CSSProperties {
        return {
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0
        };
    }

    private _handleResize: () => void = (): void => {
        this._measureAndUpdateView();
    };

    private _measureAndUpdateView(): void {
        const viewportWidth: number = window.innerWidth;

        // If currently in mobile view, check if we can switch back to desktop.
        if (this._isMobileView) {
            if (this._desktopMinWidth > 0 && viewportWidth >= this._desktopMinWidth) {
                this._isMobileView = false;

                this.setState((previousState: GlobalNavState): GlobalNavState => ({
                    ...previousState,
                    isMobileView: false
                }), (): void => {
                    // After switching to desktop, measure and calculate menu width.
                    this._measureDesktopMinWidth();
                    this._calculateMenuAvailableWidth();
                });
            }

            return;
        }

        // In desktop view, measure the right edge and check if it's clipped.
        const rightSection: HTMLDivElement | null = this._rightSectionRef.current;

        if (!rightSection) {
            return;
        }

        const rightEdge: number = rightSection.getBoundingClientRect().right;

        // Always update the desktop min width measurement.
        this._desktopMinWidth = rightEdge;

        if (rightEdge > viewportWidth) {
            this._isMobileView = true;

            this.setState((previousState: GlobalNavState): GlobalNavState => ({
                ...previousState,
                isMobileView: true
            }));
        } else {
            this._calculateMenuAvailableWidth();
        }
    }

    private _measureDesktopMinWidth(): void {
        const rightSection: HTMLDivElement | null = this._rightSectionRef.current;

        if (rightSection) {
            this._desktopMinWidth = rightSection.getBoundingClientRect().right;
        }
    }

    private _calculateMenuAvailableWidth(): void {
        const leftSection: HTMLDivElement | null = this._leftSectionRef.current;
        const rightSection: HTMLDivElement | null = this._rightSectionRef.current;

        if (!leftSection || !rightSection) {
            return;
        }

        const viewportWidth: number = window.innerWidth;
        const leftSectionWidth: number = leftSection.offsetWidth;
        const rightSectionWidth: number = rightSection.offsetWidth;

        // Calculate available width for menu.
        // Available = Viewport - EdgePadding*2 - LeftSection - TitleMenuSpacing - MenuRightBoundarySpacing - RightSection.
        const availableWidth: number = viewportWidth
            - (GlobalNav.EDGE_PADDING * 2)
            - leftSectionWidth
            - GlobalNav.TITLE_MENU_SPACING
            - GlobalNav.MENU_RIGHT_BOUNDARY_SPACING
            - rightSectionWidth;

        this.setState((previousState: GlobalNavState): GlobalNavState => ({
            ...previousState,
            menuAvailableWidth: Math.max(0, availableWidth)
        }));
    }

    private _renderNavMenu(availableWidth: number): ReactNode {
        const { menuItems } = this.props;

        if (menuItems.length === 0) {
            return null;
        }

        return (
            <NavMenu
                menuItems={menuItems}
                availableWidth={availableWidth}
            />
        );
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
                <span style={this._getBadgeLineStyles(false)}>Injected Navigation Bar Powered by</span>
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
