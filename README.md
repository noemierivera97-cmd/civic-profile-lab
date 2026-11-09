# Civic Profile Lab

An independent educational web app with fictional profiles and sample documents. Use sample details and a picture you are comfortable saving on this device.

## Use it on iPhone

1. Open the published website in Safari. Enter sample details and choose **Take photo** or **Photo from library**.
2. Tap **Create** to open the dashboard in Safari. The browser saves the profile and resized photo on the device.
3. Tap **Share → Add to Home Screen** in Safari to add the website icon.
4. When the saved-profile login appears, type any non-empty demo password and tap **Continue**. Use **Remove saved profile** to clear the browser's copy.

If the Home Screen app starts with a blank profile form, it is using its own storage. Create the sample profile once from the icon and use that icon for future visits.

## Preview locally

From this directory, run `python -m http.server 8000 --bind 127.0.0.1` and open `http://127.0.0.1:8000`. No build step or packages are required.

## Publish on GitHub Pages

1. Copy the contents of this directory into the root of your repository's `main` branch. Include `.nojekyll`.
2. In **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/ (root)**, and click **Save**.
3. Open the published URL shown in **Settings → Pages**.
