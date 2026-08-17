# Privacy

Looktwice runs in your browser. There is no Looktwice server.

When you click the toolbar icon it asks Chrome for the active tab and injects a
script into that tab. The script reads link hrefs, link text, form actions,
hidden input names, and whether a password field is present. That data is shown
in the popup and then thrown away. Hidden field *values* are not read.

The extension does not set cookies, does not use analytics, and does not call
home. Copying the cleaned URL uses the clipboard on your machine.

Chrome will show a permission warning for `activeTab` and `scripting` because
those APIs can read the page you are looking at. That is the whole product.
