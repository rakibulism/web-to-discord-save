// Content script for detecting social media posts and adding save buttons
class WebToDiscordSave
{
    constructor ()
    {
        this.observers = new Map();
        this.saveButtons = new Set();
        this.currentPost = null;
        this.keywords = [
            'design', 'ui', 'ux', 'frontend', 'backend', 'mobile', 'web',
            'illustration', 'art', 'photography', 'video', 'animation',
            'marketing', 'business', 'startup', 'tech', 'ai', 'ml',
            'inspiration', 'tutorial', 'tips', 'resources'
        ];
        this.maxSelections = 2;
        this.selectedKeywords = new Set();

        this.init();
    }

    init ()
    {
        this.setupKeyboardShortcuts();
        this.observePageChanges();
    }

    setupKeyboardShortcuts ()
    {
        document.addEventListener( 'keydown', ( e ) =>
        {
            // Ctrl+Shift+S or Cmd+Shift+S
            if ( ( e.ctrlKey || e.metaKey ) && e.shiftKey && e.key === 'S' )
            {
                e.preventDefault();
                this.handleKeyboardSave();
            }
        } );
    }

    handleKeyboardSave ()
    {
        const hoveredElement = document.querySelector( ':hover' );
        if ( hoveredElement )
        {
            const postContainer = this.findPostContainer( hoveredElement );
            if ( postContainer )
            {
                this.showSaveModal( postContainer );
            }
        }
    }

    observePageChanges ()
    {
        // Observe for new content (important for SPA like Twitter/X)
        const observer = new MutationObserver( ( mutations ) =>
        {
            mutations.forEach( ( mutation ) =>
            {
                mutation.addedNodes.forEach( ( node ) =>
                {
                    if ( node.nodeType === Node.ELEMENT_NODE )
                    {
                        this.processNewElements( node );
                    }
                } );
            } );
        } );

        observer.observe( document.body, {
            childList: true,
            subtree: true
        } );

        // Process existing elements
        this.processNewElements( document.body );
    }

    processNewElements ( element )
    {
        const postContainers = this.findPostContainers( element );
        postContainers.forEach( container =>
        {
            if ( !this.saveButtons.has( container ) )
            {
                this.addSaveButton( container );
                this.saveButtons.add( container );
            }
        } );
    }

    findPostContainers ( element )
    {
        const selectors = [
            // Twitter/X
            '[data-testid="tweet"]',
            '[data-testid="tweetDetail"]',
            'article[role="article"]',

            // Instagram
            'article',
            '[role="presentation"]',

            // Dribbble
            '.shot',
            '.shot-tile',

            // Facebook
            '[data-pagelet="FeedUnit_0"]',
            '[role="article"]',

            // LinkedIn
            '.feed-shared-update-v2',
            '.feed-shared-actor',

            // Generic
            '[data-testid*="post"]',
            '[data-testid*="tweet"]',
            '[data-testid*="card"]'
        ];

        const containers = [];
        selectors.forEach( selector =>
        {
            const elements = element.querySelectorAll ? element.querySelectorAll( selector ) : [];
            elements.forEach( el =>
            {
                if ( this.isValidPostContainer( el ) )
                {
                    containers.push( el );
                }
            } );
        } );

        return containers;
    }

    isValidPostContainer ( element )
    {
        // Check if element has content that looks like a social media post
        const hasText = element.textContent && element.textContent.trim().length > 10;
        const hasImages = element.querySelector( 'img' );
        const hasVideo = element.querySelector( 'video' );
        const hasLinks = element.querySelector( 'a[href]' );

        return hasText && ( hasImages || hasVideo || hasLinks );
    }

    findPostContainer ( element )
    {
        let current = element;
        while ( current && current !== document.body )
        {
            if ( this.isValidPostContainer( current ) )
            {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    }

    addSaveButton ( container )
    {
        // Make container relative positioned if not already
        const computedStyle = window.getComputedStyle( container );
        if ( computedStyle.position === 'static' )
        {
            container.style.position = 'relative';
        }

        // Create save button
        const saveButton = document.createElement( 'button' );
        saveButton.className = 'web-to-discord-save-btn';
        saveButton.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
      </svg>
    `;
        saveButton.title = 'Save to Discord';

        saveButton.addEventListener( 'click', ( e ) =>
        {
            e.preventDefault();
            e.stopPropagation();
            this.showSaveModal( container );
        } );

        container.appendChild( saveButton );
    }

    showSaveModal ( postContainer )
    {
        this.currentPost = this.extractPostData( postContainer );
        this.selectedKeywords.clear();
        this.createModal();
    }

    extractPostData ( container )
    {
        const data = {
            title: '',
            description: '',
            author: '',
            authorUrl: '',
            postUrl: window.location.href,
            mediaUrls: [] as Array<{ type: string, url: string, alt?: string }>,
            platform: this.detectPlatform()
        };

        // Extract title/description
        const textSelectors = [
            '[data-testid="tweetText"]',
            '[data-testid="tweet"] p',
            'p',
            '.tweet-text',
            '.post-text',
            '[role="presentation"] p'
        ];

        for ( const selector of textSelectors )
        {
            const textElement = container.querySelector( selector );
            if ( textElement && textElement.textContent.trim() )
            {
                data.description = textElement.textContent.trim();
                break;
            }
        }

        // Extract author
        const authorSelectors = [
            '[data-testid="User-Name"]',
            '[data-testid="UserAvatar-Container-"]',
            '.username',
            '.user-name',
            '[data-testid="user-name"]'
        ];

        for ( const selector of authorSelectors )
        {
            const authorElement = container.querySelector( selector );
            if ( authorElement )
            {
                data.author = authorElement.textContent.trim();
                const authorLink = authorElement.closest( 'a' );
                if ( authorLink )
                {
                    data.authorUrl = authorLink.href;
                }
                break;
            }
        }

        // Extract media URLs
        const images = container.querySelectorAll( 'img[src]' );
        images.forEach( img =>
        {
            if ( img.src && !img.src.includes( 'data:' ) && !img.src.includes( 'blob:' ) )
            {
                data.mediaUrls.push( {
                    type: 'image',
                    url: img.src,
                    alt: img.alt || ''
                } );
            }
        } );

        const videos = container.querySelectorAll( 'video source, video[src]' );
        videos.forEach( video =>
        {
            const src = video.src || video.getAttribute( 'src' );
            if ( src && !src.includes( 'data:' ) && !src.includes( 'blob:' ) )
            {
                data.mediaUrls.push( {
                    type: 'video',
                    url: src
                } );
            }
        } );

        // Generate title from description if not found
        if ( !data.title && data.description )
        {
            data.title = data.description.substring( 0, 100 ) + ( data.description.length > 100 ? '...' : '' );
        }

        return data;
    }

    detectPlatform ()
    {
        const hostname = window.location.hostname;
        if ( hostname.includes( 'twitter.com' ) || hostname.includes( 'x.com' ) ) return 'twitter';
        if ( hostname.includes( 'instagram.com' ) ) return 'instagram';
        if ( hostname.includes( 'dribbble.com' ) ) return 'dribbble';
        if ( hostname.includes( 'facebook.com' ) ) return 'facebook';
        if ( hostname.includes( 'linkedin.com' ) ) return 'linkedin';
        return 'unknown';
    }

    createModal ()
    {
        // Remove existing modal
        const existingModal = document.querySelector( '.web-to-discord-modal-overlay' );
        if ( existingModal )
        {
            existingModal.remove();
        }

        const modalOverlay = document.createElement( 'div' );
        modalOverlay.className = 'web-to-discord-modal-overlay';
        modalOverlay.innerHTML = this.getModalHTML();

        document.body.appendChild( modalOverlay );

        // Show modal with animation
        setTimeout( () =>
        {
            modalOverlay.classList.add( 'visible' );
        }, 10 );

        this.setupModalEvents( modalOverlay );
    }

    getModalHTML ()
    {
        return `
      <div class="web-to-discord-modal">
        <div class="web-to-discord-modal-header">
          <h3 class="web-to-discord-modal-title">Save to Discord</h3>
          <button class="web-to-discord-modal-close">&times;</button>
        </div>
        
        <div class="web-to-discord-post-preview">
          <div class="web-to-discord-post-preview-title">${ this.escapeHtml( this.currentPost?.title || '' ) }</div>
          <div class="web-to-discord-post-preview-author">by ${ this.escapeHtml( this.currentPost?.author || '' ) }</div>
          <div class="web-to-discord-post-preview-description">${ this.escapeHtml( this.currentPost?.description || '' ) }</div>
          <a href="${ this.currentPost?.postUrl || '' }" target="_blank" class="web-to-discord-post-preview-url">${ this.currentPost?.postUrl || '' }</a>
        </div>

        <div class="web-to-discord-selection-info">
          <strong>Select up to ${ this.maxSelections } keywords</strong> to route this post to the right Discord channels
        </div>

        <div class="web-to-discord-keyword-grid">
          ${ this.keywords.map( keyword => `
            <button class="web-to-discord-keyword-btn" data-keyword="${ keyword }">
              ${ keyword }
            </button>
          `).join( '' ) }
        </div>

        <div class="web-to-discord-modal-actions">
          <button class="web-to-discord-btn web-to-discord-btn-secondary" id="cancel-save">Cancel</button>
          <button class="web-to-discord-btn web-to-discord-btn-primary" id="save-to-discord" disabled>
            Save to Discord
          </button>
        </div>
      </div>
    `;
    }

    setupModalEvents ( modalOverlay )
    {
        const modal = modalOverlay.querySelector( '.web-to-discord-modal' );
        const closeBtn = modalOverlay.querySelector( '.web-to-discord-modal-close' );
        const cancelBtn = modalOverlay.querySelector( '#cancel-save' );
        const saveBtn = modalOverlay.querySelector( '#save-to-discord' );
        const keywordBtns = modalOverlay.querySelectorAll( '.web-to-discord-keyword-btn' );

        // Close modal events
        const closeModal = () =>
        {
            modalOverlay.classList.remove( 'visible' );
            setTimeout( () =>
            {
                modalOverlay.remove();
            }, 300 );
        };

        closeBtn.addEventListener( 'click', closeModal );
        cancelBtn.addEventListener( 'click', closeModal );
        modalOverlay.addEventListener( 'click', ( e ) =>
        {
            if ( e.target === modalOverlay )
            {
                closeModal();
            }
        } );

        // Keyword selection
        keywordBtns.forEach( btn =>
        {
            btn.addEventListener( 'click', () =>
            {
                const keyword = btn.dataset.keyword;

                if ( this.selectedKeywords.has( keyword ) )
                {
                    this.selectedKeywords.delete( keyword );
                    btn.classList.remove( 'selected' );
                } else if ( this.selectedKeywords.size < this.maxSelections )
                {
                    this.selectedKeywords.add( keyword );
                    btn.classList.add( 'selected' );
                }

                this.updateKeywordButtons( keywordBtns );
                this.updateSaveButton( saveBtn );
            } );
        } );

        // Save to Discord
        saveBtn.addEventListener( 'click', () =>
        {
            this.saveToDiscord();
            closeModal();
        } );
    }

    updateKeywordButtons ( keywordBtns )
    {
        keywordBtns.forEach( btn =>
        {
            const keyword = btn.dataset.keyword;
            const isSelected = this.selectedKeywords.has( keyword );
            const isDisabled = !isSelected && this.selectedKeywords.size >= this.maxSelections;

            btn.classList.toggle( 'selected', isSelected );
            btn.classList.toggle( 'disabled', isDisabled );
        } );
    }

    updateSaveButton ( saveBtn )
    {
        const hasSelection = this.selectedKeywords.size > 0;
        saveBtn.disabled = !hasSelection;
    }

    async saveToDiscord ()
    {
        try
        {
            const postData = {
                ...this.currentPost,
                keywords: Array.from( this.selectedKeywords ),
                timestamp: new Date().toISOString()
            };

            // Send to background script
            if ( typeof chrome !== 'undefined' && chrome.runtime )
            {
                chrome.runtime.sendMessage( {
                    action: 'saveToDiscord',
                    data: postData
                } );
            }

            // Show success feedback
            this.showNotification( 'Post saved to Discord!', 'success' );
        } catch ( error )
        {
            console.error( 'Error saving to Discord:', error );
            this.showNotification( 'Failed to save post', 'error' );
        }
    }

    showNotification ( message, type = 'info' )
    {
        const notification = document.createElement( 'div' );
        notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${ type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3' };
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 1000000;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
        notification.textContent = message;

        document.body.appendChild( notification );

        setTimeout( () =>
        {
            notification.style.transform = 'translateX(0)';
        }, 10 );

        setTimeout( () =>
        {
            notification.style.transform = 'translateX(100%)';
            setTimeout( () =>
            {
                notification.remove();
            }, 300 );
        }, 3000 );
    }

    escapeHtml ( text )
    {
        const div = document.createElement( 'div' );
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the extension
if ( typeof window !== 'undefined' )
{
    ( window as any ).webToDiscordSave = new WebToDiscordSave();
}
