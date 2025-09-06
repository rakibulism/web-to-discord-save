chrome.commands.onCommand.addListener( ( command ) =>
{
    if ( command === 'save-post' )
    {
        chrome.tabs.query( { active: true, currentWindow: true }, ( tabs ) =>
        {
            chrome.tabs.sendMessage( tabs[ 0 ].id, { action: 'openModal' } );
        } );
    }
} );