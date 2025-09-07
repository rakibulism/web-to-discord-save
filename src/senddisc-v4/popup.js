document.addEventListener( "DOMContentLoaded", () =>
{
    const webhookInput = document.getElementById( "webhook" );
    const channelInput = document.getElementById( "defaultChannel" );
    const saveBtn = document.getElementById( "save" );
    const status = document.getElementById( "status" );

    // Load saved settings
    chrome.storage.sync.get( [ "webhook", "defaultChannel" ], ( data ) =>
    {
        if ( data.webhook ) webhookInput.value = data.webhook;
        if ( data.defaultChannel ) channelInput.value = data.defaultChannel;
    } );

    // Save settings
    saveBtn.addEventListener( "click", () =>
    {
        const webhook = webhookInput.value.trim();
        const defaultChannel = channelInput.value.trim();

        if ( !webhook )
        {
            status.textContent = "⚠️ Please enter a webhook URL";
            return;
        }

        chrome.storage.sync.set( { webhook, defaultChannel }, () =>
        {
            status.textContent = "✅ Settings saved!";
            setTimeout( () => ( status.textContent = "" ), 2000 );
        } );
    } );
} );
