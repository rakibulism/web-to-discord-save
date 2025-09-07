document.getElementById( "saveChannel" ).addEventListener( "click", () =>
{
    const url = document.getElementById( "channelUrl" ).value;
    if ( url )
    {
        chrome.storage.sync.set( { defaultChannel: url }, () =>
        {
            document.getElementById( "status" ).innerText = "Default channel saved ✅";
        } );
    }
} );
