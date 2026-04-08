import { Component, createRef, type CSSProperties, type ReactNode, type RefObject } from 'react';

import { type MenuItem } from '../MenuItem';


export interface NavMenuProperties {
    menuItems: MenuItem[];
    availableWidth: number;
}


export interface NavMenuState {
    isDropdownOpen: boolean;
    measuredWidths: number[];
    hasMeasured: boolean;
}


class NavMenu extends Component<NavMenuProperties, NavMenuState> {
    private static readonly MENU_ITEM_SPACING: number = 32;
    private static readonly OVERFLOW_BUTTON_WIDTH: number = 40;

    private _menuContainerRef: RefObject<HTMLDivElement | null> = createRef<HTMLDivElement>();
    private _itemRefs: RefObject<HTMLAnchorElement | null>[] = [];
    private _dropdownRef: RefObject<HTMLDivElement | null> = createRef<HTMLDivElement>();

    public constructor(properties: NavMenuProperties) {
        super(properties);

        this.state = {
            isDropdownOpen: false,
            measuredWidths: [],
            hasMeasured: false
        };
    }

    public componentDidMount(): void {
        this._measureMenuItems();

        document.addEventListener('click', this._handleDocumentClick);
    }

    public componentDidUpdate(previousProperties: NavMenuProperties): void {
        if (previousProperties.menuItems !== this.props.menuItems) {
            this._measureMenuItems();
        }
    }

    public componentWillUnmount(): void {
        document.removeEventListener('click', this._handleDocumentClick);
    }

    public render(): ReactNode {
        const { menuItems } = this.props;

        if (menuItems.length === 0) {
            return null;
        }

        const { hasMeasured } = this.state;
        const { visibleItems, overflowItems } = this._calculateVisibleItems();

        return (
            <div style={this._getContainerStyles()}>
                {/* Hidden measurement container. */}
                {!hasMeasured && (
                    <div
                        ref={this._menuContainerRef}
                        style={this._getMeasurementContainerStyles()}
                    >
                        {menuItems.map((item: MenuItem, index: number): ReactNode => (
                            <a
                                key={item.identifier}
                                ref={this._getOrCreateItemRef(index)}
                                style={this._getMenuItemStyles()}
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                )}

                {/* Visible menu items. */}
                {hasMeasured && visibleItems.map((item: MenuItem, index: number): ReactNode => (
                    <a
                        key={item.identifier}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            ...this._getMenuItemStyles(),
                            marginLeft: index > 0 ? `${NavMenu.MENU_ITEM_SPACING}px` : '0'
                        }}
                        onMouseEnter={(event: React.MouseEvent<HTMLAnchorElement>): void => {
                            event.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(event: React.MouseEvent<HTMLAnchorElement>): void => {
                            event.currentTarget.style.color = '#8b949e';
                        }}
                    >
                        {item.label}
                    </a>
                ))}

                {/* Overflow button and dropdown. */}
                {hasMeasured && overflowItems.length > 0 && this._renderOverflowMenu(overflowItems)}
            </div>
        );
    }

    private _handleDocumentClick: (event: MouseEvent) => void = (event: MouseEvent): void => {
        const { isDropdownOpen } = this.state;

        if (!isDropdownOpen) {
            return;
        }

        const dropdownElement: HTMLDivElement | null = this._dropdownRef.current;

        // Check if click is outside the dropdown container (which includes the button).
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
            this.setState((previousState: NavMenuState): NavMenuState => ({
                ...previousState,
                isDropdownOpen: false
            }));
        }
    };

    private _handleOverflowButtonClick: (event: React.MouseEvent<HTMLButtonElement>) => void = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        event.stopPropagation();

        this.setState((previousState: NavMenuState): NavMenuState => ({
            ...previousState,
            isDropdownOpen: !previousState.isDropdownOpen
        }));
    };

    private _measureMenuItems(): void {
        const { menuItems } = this.props;

        // Initialize refs array for all menu items.
        this._itemRefs = menuItems.map((): RefObject<HTMLAnchorElement | null> => createRef<HTMLAnchorElement>());

        // Wait for next frame to ensure refs are attached.
        requestAnimationFrame((): void => {
            const measuredWidths: number[] = this._itemRefs.map((ref: RefObject<HTMLAnchorElement | null>): number => {
                if (ref.current) {
                    return ref.current.offsetWidth;
                }

                return 0;
            });

            this.setState((previousState: NavMenuState): NavMenuState => ({
                ...previousState,
                measuredWidths: measuredWidths,
                hasMeasured: true
            }));
        });
    }

    private _calculateVisibleItems(): { visibleItems: MenuItem[]; overflowItems: MenuItem[] } {
        const { menuItems, availableWidth } = this.props;
        const { measuredWidths, hasMeasured } = this.state;

        if (!hasMeasured || measuredWidths.length === 0) {
            return { visibleItems: [], overflowItems: [] };
        }

        let currentWidth: number = 0;
        let visibleCount: number = 0;

        for (let index: number = 0; index < menuItems.length; index++) {
            const itemWidth: number = measuredWidths[index] || 0;
            const spacingWidth: number = index > 0 ? NavMenu.MENU_ITEM_SPACING : 0;
            const totalItemWidth: number = itemWidth + spacingWidth;

            // Check if remaining items need overflow button space.
            const remainingItems: number = menuItems.length - index - 1;
            const needsOverflowSpace: boolean = remainingItems > 0;
            const reservedWidth: number = needsOverflowSpace ? NavMenu.OVERFLOW_BUTTON_WIDTH + NavMenu.MENU_ITEM_SPACING : 0;

            if (currentWidth + totalItemWidth + reservedWidth <= availableWidth) {
                currentWidth += totalItemWidth;
                visibleCount++;
            } else {
                // If this is the last item and it doesn't fit, check if it fits without overflow button.
                if (remainingItems === 0 && currentWidth + totalItemWidth <= availableWidth) {
                    visibleCount++;
                }

                break;
            }
        }

        // If all items fit, show all.
        if (visibleCount === menuItems.length) {
            return { visibleItems: menuItems, overflowItems: [] };
        }

        // Otherwise, leave room for overflow button.
        return {
            visibleItems: menuItems.slice(0, visibleCount),
            overflowItems: menuItems.slice(visibleCount)
        };
    }

    private _getOrCreateItemRef(index: number): RefObject<HTMLAnchorElement | null> {
        if (!this._itemRefs[index]) {
            this._itemRefs[index] = createRef<HTMLAnchorElement>();
        }

        return this._itemRefs[index];
    }

    private _getContainerStyles(): CSSProperties {
        return {
            display: 'flex',
            alignItems: 'center',
            position: 'relative'
        };
    }

    private _getMeasurementContainerStyles(): CSSProperties {
        return {
            position: 'absolute',
            visibility: 'hidden',
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'nowrap'
        };
    }

    private _getMenuItemStyles(): CSSProperties {
        return {
            color: '#8b949e',
            fontSize: '14px',
            fontWeight: 500,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            transition: 'color 0.15s ease',
            cursor: 'pointer'
        };
    }

    private _getOverflowButtonStyles(): CSSProperties {
        return {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: `${NavMenu.OVERFLOW_BUTTON_WIDTH}px`,
            height: '32px',
            marginLeft: `${NavMenu.MENU_ITEM_SPACING}px`,
            padding: 0,
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '6px',
            color: '#8b949e',
            fontSize: '20px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease, color 0.15s ease'
        };
    }

    private _getOverflowIconStyles(): CSSProperties {
        return {
            width: '18px',
            height: '18px',
            display: 'block'
        };
    }

    private _getDropdownStyles(): CSSProperties {
        return {
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            padding: '8px 0',
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '6px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            zIndex: 1000,
            minWidth: '160px'
        };
    }

    private _getDropdownItemStyles(): CSSProperties {
        return {
            display: 'block',
            padding: '8px 16px',
            color: '#8b949e',
            fontSize: '14px',
            fontWeight: 500,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            transition: 'background-color 0.15s ease, color 0.15s ease'
        };
    }

    private _renderOverflowMenu(overflowItems: MenuItem[]): ReactNode {
        const { isDropdownOpen } = this.state;

        return (
            <div
                ref={this._dropdownRef}
                style={{ position: 'relative' }}
            >
                <button
                    type="button"
                    style={this._getOverflowButtonStyles()}
                    onClick={this._handleOverflowButtonClick}
                    onMouseEnter={(event: React.MouseEvent<HTMLButtonElement>): void => {
                        event.currentTarget.style.backgroundColor = '#21262d';
                        event.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(event: React.MouseEvent<HTMLButtonElement>): void => {
                        event.currentTarget.style.backgroundColor = 'transparent';
                        event.currentTarget.style.color = '#8b949e';
                    }}
                >
                    <svg
                        viewBox="0 0 24 24"
                        style={this._getOverflowIconStyles()}
                        aria-hidden="true"
                    >
                        <path
                            d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"
                            fill="currentColor"
                        />
                    </svg>
                </button>

                {isDropdownOpen && (
                    <div style={this._getDropdownStyles()}>
                        {overflowItems.map((item: MenuItem): ReactNode => (
                            <a
                                key={item.identifier}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={this._getDropdownItemStyles()}
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
                    </div>
                )}
            </div>
        );
    }
}


export default NavMenu;
