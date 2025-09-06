// Background script for Discord integration and message handling
class DiscordIntegration
{
    constructor ()
    {
        this.webhookUrl = 'https://discord.com/api/webhooks/1413746841077551104/wxCPSJ4eIk7CTYrKjb3LK-1Da269X34l4Sbyb0Em8djLQ2X6oXobVju6GbtfkNlPo67Y';
        this.channelMappings = new Map();
        this.setupMessageListener();
    }

    setupMessageListener ()
    {
        if ( typeof chrome !== 'undefined' && chrome.runtime )
        {
            chrome.runtime.onMessage.addListener( ( request, sender, sendResponse ) =>
            {
                if ( request.action === 'saveToDiscord' )
                {
                    this.handleSaveToDiscord( request.data );
                }
            } );
        }
    }


    async handleSaveToDiscord ( postData )
    {
        try
        {

            // Determine target channels based on keywords
            const targetChannels = this.getTargetChannels( postData.keywords );

            if ( targetChannels.length === 0 )
            {
                // Send to default channel if no specific mapping
                await this.sendToDiscord( postData, null );
            } else
            {
                // Send to each mapped channel
                for ( const channelId of targetChannels )
                {
                    await this.sendToDiscord( postData, channelId );
                }
            }

            // Show success notification
            if ( typeof chrome !== 'undefined' && chrome.tabs )
            {
                chrome.tabs.query( { active: true, currentWindow: true }, ( tabs ) =>
                {
                    if ( tabs[ 0 ] )
                    {
                        chrome.tabs.sendMessage( tabs[ 0 ].id, {
                            action: 'showNotification',
                            message: 'Post saved to Discord!',
                            type: 'success'
                        } );
                    }
                } );
            }

        } catch ( error )
        {
            console.error( 'Error saving to Discord:', error );

            // Show error notification
            if ( typeof chrome !== 'undefined' && chrome.tabs )
            {
                chrome.tabs.query( { active: true, currentWindow: true }, ( tabs ) =>
                {
                    if ( tabs[ 0 ] )
                    {
                        chrome.tabs.sendMessage( tabs[ 0 ].id, {
                            action: 'showNotification',
                            message: 'Failed to save post to Discord',
                            type: 'error'
                        } );
                    }
                } );
            }
        }
    }

    getTargetChannels ( keywords )
    {
        const channels = new Set();

        keywords.forEach( keyword =>
        {
            const mappedChannels = this.channelMappings.get( keyword );
            if ( mappedChannels )
            {
                mappedChannels.forEach( channelId => channels.add( channelId ) );
            }
        } );

        return Array.from( channels );
    }

    async sendToDiscord ( postData, channelId = null )
    {
        const embed = this.createDiscordEmbed( postData );

        const payload = {
            embeds: [ embed ],
            username: 'Web to Discord Save',
            avatar_url: 'https://cdn.discordapp.com/attachments/1234567890/1234567890/save-icon.png'
        };

        // If specific channel, modify webhook URL
        let webhookUrl = this.webhookUrl;
        if ( channelId )
        {
            // For Discord webhooks, we need to create separate webhooks for each channel
            // or use a bot token. For now, we'll use the main webhook.
            // In a production setup, you'd want to store multiple webhook URLs or use a bot.
        }

        const response = await fetch( webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify( payload )
        } );

        if ( !response.ok )
        {
            throw new Error( `Discord API error: ${ response.status } ${ response.statusText }` );
        }

        return response.json();
    }

    createDiscordEmbed ( postData )
    {
        const embed = {
            title: postData.title || 'Saved Post',
            description: postData.description || 'No description available',
            url: postData.postUrl,
            color: this.getPlatformColor( postData.platform ),
            timestamp: postData.timestamp,
            footer: {
                text: `Saved from ${ this.getPlatformName( postData.platform ) }`,
                icon_url: this.getPlatformIcon( postData.platform )
            },
            author: {
                name: postData.author || 'Unknown Author',
                url: postData.authorUrl || postData.postUrl
            },
            fields: [] as Array<{ name: string, value: any, inline: boolean }>
        };

        // Add keywords as fields
        if ( postData.keywords && postData.keywords.length > 0 )
        {
            embed.fields.push( {
                name: 'Keywords',
                value: postData.keywords.map( k => `\`${ k }\`` ).join( ' ' ),
                inline: true
            } );
        }

        // Add media if available
        if ( postData.mediaUrls && postData.mediaUrls.length > 0 )
        {
            const mediaInfo = postData.mediaUrls.map( media =>
            {
                if ( media.type === 'image' )
                {
                    return `🖼️ [Image](${ media.url })`;
                } else if ( media.type === 'video' )
                {
                    return `🎥 [Video](${ media.url })`;
                }
                return `📎 [Media](${ media.url })`;
            } ).join( '\n' );

            embed.fields.push( {
                name: 'Media',
                value: mediaInfo,
                inline: false
            } );

            // Set thumbnail if first media is an image
            const firstImage = postData.mediaUrls.find( media => media.type === 'image' );
            if ( firstImage )
            {
                embed.thumbnail = {
                    url: firstImage.url
                };
            }
        }

        // Add platform-specific information
        embed.fields.push( {
            name: 'Platform',
            value: this.getPlatformName( postData.platform ),
            inline: true
        } );

        return embed;
    }

    getPlatformColor ( platform )
    {
        const colors = {
            twitter: 0x1DA1F2,
            instagram: 0xE4405F,
            dribbble: 0xEA4C89,
            facebook: 0x1877F2,
            linkedin: 0x0077B5,
            unknown: 0x5865F2
        };
        return colors[ platform ] || colors.unknown;
    }

    getPlatformName ( platform )
    {
        const names = {
            twitter: 'Twitter/X',
            instagram: 'Instagram',
            dribbble: 'Dribbble',
            facebook: 'Facebook',
            linkedin: 'LinkedIn',
            unknown: 'Web'
        };
        return names[ platform ] || names.unknown;
    }

    getPlatformIcon ( platform )
    {
        const icons = {
            twitter: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitter.svg',
            instagram: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg',
            dribbble: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/dribbble.svg',
            facebook: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg',
            linkedin: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg',
            unknown: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/web.svg'
        };
        return icons[ platform ] || icons.unknown;
    }
}

// Initialize Discord integration
const discordIntegration = new DiscordIntegration();
