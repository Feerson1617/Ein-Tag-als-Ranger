"""Wait for the application's async file preview, without changing game state."""
def choose_import_file(page,payload):
    # Two consecutive rejects can have identical text. Observe a fresh response
    # mutation rather than mistaking the previous file's message for completion.
    page.locator('#import-preview').evaluate('''element=>{
      window.__qaImportPreviewWait?.observer.disconnect();
      const state={changed:false};state.observer=new MutationObserver(()=>{state.changed=true;});
      state.observer.observe(element,{childList:true,subtree:true,characterData:true});
      window.__qaImportPreviewWait=state;
    }''')
    try:
        page.locator('#import').set_input_files(payload)
        page.wait_for_function('window.__qaImportPreviewWait.changed')
    finally:
        page.evaluate('window.__qaImportPreviewWait?.observer.disconnect()')
