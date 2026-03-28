import { Component, type CSSProperties, type ReactNode } from 'react';


export interface GlobalNavProperties {
    iconUrl: string;
    title: string;
}


class GlobalNav extends Component<GlobalNavProperties, {}> {
    private static readonly NAV_HEIGHT: number = 64;

    public render(): ReactNode {
        return (
            <nav style={this._getNavStyles()}>
                <div style={this._getContainerStyles()}>
                    {this._renderIcon()}
                    {this._renderTitle()}
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
            zIndex: 9999,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif'
        };
    }

    private _getContainerStyles(): CSSProperties {
        return {
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px'
        };
    }

    private _getIconStyles(): CSSProperties {
        return {
            width: '32px',
            height: '32px',
            minWidth: '32px',
            minHeight: '32px',
            marginRight: '32px',
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
}


export default GlobalNav;
