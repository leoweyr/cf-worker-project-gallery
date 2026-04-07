import { type GalleryMeta } from '../types/GalleryMeta';


export class BodyInjector {
    private static readonly _NAVIGATION_HEIGHT: number = 64;

    private readonly _galleryMeta: GalleryMeta;
    private readonly _uiGalleryBundleUrl: string;
    private _hasInjectedMeta: boolean = false;

    constructor(galleryMeta: GalleryMeta, uiGalleryBundleUrl: string) {
        this._galleryMeta = galleryMeta;
        this._uiGalleryBundleUrl = uiGalleryBundleUrl;
    }

    private _createViewportStyle(): string {
        return `<style>
            html,
            body {
                width: 100vw !important;
                height: calc(100vh - ${BodyInjector._NAVIGATION_HEIGHT}px) !important;
            }
        </style>`;
    }

    private _createViewportShimScript(): string {
        return `<script>(function () {
            const resolveContainer = function () {
                return document.getElementById('gallery-original-content');
            };
            
            const synchronizeViewportSize = function () {
                const container = resolveContainer();
                
                if (!container) {
                    return;
                }
                
                const viewportWidth = container.clientWidth + 'px';
                const viewportHeight = container.clientHeight + 'px';
                document.documentElement.style.width = viewportWidth;
                document.documentElement.style.height = viewportHeight;
                document.body.style.width = viewportWidth;
                document.body.style.height = viewportHeight;
            };
            
            const redefineViewportDimension = function (propertyName, valueResolver) {
                try {
                    Object.defineProperty(window, propertyName, {
                        configurable: true,
                        get: valueResolver
                    });
                } catch {
                }
            };
            
            redefineViewportDimension('innerWidth', function () {
                const container = resolveContainer();
                return container ? container.clientWidth : document.documentElement.clientWidth;
            });
            
            redefineViewportDimension('innerHeight', function () {
                const container = resolveContainer();
                return container ? container.clientHeight : document.documentElement.clientHeight;
            });
            
            window.addEventListener('resize', synchronizeViewportSize);
            window.addEventListener('orientationchange', synchronizeViewportSize);
            
            if (typeof ResizeObserver !== 'undefined') {
                const resizeObserver = new ResizeObserver(synchronizeViewportSize);
                const observeContainer = function () {
                    const container = resolveContainer();
                    
                    if (!container) {
                        requestAnimationFrame(observeContainer);
                        return;
                    }
                    
                    resizeObserver.observe(container);
                    synchronizeViewportSize();
                };
                
                observeContainer();
            } else {
                requestAnimationFrame(synchronizeViewportSize);
            }
        })();</script>`;
    }

    private _createViewportCompatibilityScript(): string {
        return `<script>(function () {
            const viewportHeightValues = new Set(['100vh', '100dvh', '100svh', '100lvh']);
            const viewportWidthValues = new Set(['100vw', '100dvw', '100svw', '100lvw']);
            
            const normalizeViewportValue = function (value) {
                return value.trim().toLowerCase();
            };
            
            const replaceViewportBasedStyles = function (htmlElement) {
                const resolvedHeightValue = normalizeViewportValue(htmlElement.style.height);
                const resolvedMinHeightValue = normalizeViewportValue(htmlElement.style.minHeight);
                const resolvedMaxHeightValue = normalizeViewportValue(htmlElement.style.maxHeight);
                const resolvedWidthValue = normalizeViewportValue(htmlElement.style.width);
                const resolvedMinWidthValue = normalizeViewportValue(htmlElement.style.minWidth);
                const resolvedMaxWidthValue = normalizeViewportValue(htmlElement.style.maxWidth);
                
                if (viewportHeightValues.has(resolvedHeightValue)) {
                    htmlElement.style.height = '100%';
                }
                
                if (viewportHeightValues.has(resolvedMinHeightValue)) {
                    htmlElement.style.minHeight = '100%';
                }
                
                if (viewportHeightValues.has(resolvedMaxHeightValue)) {
                    htmlElement.style.maxHeight = '100%';
                }
                
                if (viewportWidthValues.has(resolvedWidthValue)) {
                    htmlElement.style.width = '100%';
                }
                
                if (viewportWidthValues.has(resolvedMinWidthValue)) {
                    htmlElement.style.minWidth = '100%';
                }
                
                if (viewportWidthValues.has(resolvedMaxWidthValue)) {
                    htmlElement.style.maxWidth = '100%';
                }
            };
            
            const normalizeViewportStyles = function (rootElement) {
                replaceViewportBasedStyles(rootElement);
                const childElements = rootElement.querySelectorAll('*');
                
                for (const childElement of childElements) {
                    if (!(childElement instanceof HTMLElement)) {
                        continue;
                    }
                    replaceViewportBasedStyles(childElement);
                }
            };
            
            const resolveContainer = function () {
                return document.getElementById('gallery-original-content');
            };
            
            const observeContainer = function () {
                const container = resolveContainer();
                
                if (!container) {
                    requestAnimationFrame(observeContainer);
                    return;
                }
                
                normalizeViewportStyles(container);
                
                const mutationObserver = new MutationObserver(function (mutationRecords) {
                    for (const mutationRecord of mutationRecords) {
                        if (mutationRecord.type === 'attributes') {
                            if (mutationRecord.target instanceof HTMLElement) {
                                replaceViewportBasedStyles(mutationRecord.target);
                            }
                            continue;
                        }
                        
                        if (mutationRecord.type === 'childList') {
                            for (const addedNode of mutationRecord.addedNodes) {
                                if (!(addedNode instanceof HTMLElement)) {
                                    continue;
                                }
                                
                                normalizeViewportStyles(addedNode);
                            }
                        }
                    }
                });
                
                mutationObserver.observe(container, {
                    subtree: true,
                    childList: true,
                    attributes: true,
                    attributeFilter: ['style']
                });
            };
            
            observeContainer();
        })();</script>`;
    }

    public createBodyHandler(): HTMLRewriterElementContentHandlers {
        return {
            element: (element: Element): void => {

                if (!this._hasInjectedMeta) {
                    const metaScript: string = `<script>window.__GALLERY_META__ = ${JSON.stringify(this._galleryMeta)};</script>`;
                    const mountPoint: string = '<div id="gallery-root" style="position: relative; z-index: 2147483647;"></div>';
                    const viewportStyle: string = this._createViewportStyle();
                    const viewportShimScript: string = this._createViewportShimScript();
                    const viewportCompatibilityScript: string = this._createViewportCompatibilityScript();
                    const uiScript: string = `<script defer src="${this._uiGalleryBundleUrl}"></script>`;
                    const bodyLockScript: string = '<script>document.documentElement.style.margin="0";document.body.style.margin="0";document.body.style.overflow="hidden";</script>';
                    const wrapperOpen: string = `<div id="gallery-original-content" style="position: fixed; top: ${BodyInjector._NAVIGATION_HEIGHT}px; left: 0; right: 0; bottom: 0; overflow: auto; box-sizing: border-box; z-index: 1; transform: translateZ(0);">`;

                    element.prepend(metaScript + mountPoint + viewportStyle + viewportShimScript + viewportCompatibilityScript + uiScript + bodyLockScript + wrapperOpen, { html: true });
                    this._hasInjectedMeta = true;
                }
            }
        };
    }

    public createBodyEndHandler(): HTMLRewriterElementContentHandlers {
        return {
            element: (element: Element): void => {
                element.append('</div>', { html: true });
            }
        };
    }
}
