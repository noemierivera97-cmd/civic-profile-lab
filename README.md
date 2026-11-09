# Civic Profile Lab

An independent educational website and iOS test app. Use fictional details and a picture you are comfortable including in a local file.

## Create and import a profile

1. Open the website in Safari. Fill in the first name, surname, date of birth, place of birth, and current country and city, or choose **Fill with sample details**.
2. Choose **Take photo** or **Photo from library**, then tap **Create** and **Download profile**. Safari saves `civic-profile.json` to Files. The photo is resized and included in the JSON file. The website makes no profile uploads.
3. In **Civic Profile Lab** on iOS, tap **Import Profile** and select that file from Files. The test app displays and stores one sample profile. You can replace it by importing another file or tap **Remove Profile** to clear it from the app. The downloaded file can be deleted separately from Files.

This workflow creates an educational sample profile for the test app. The official mObywatel app has its own activation flow.

## Install the iOS test app

On a Mac with Xcode 15 or newer, open `mObywatel-master/iOS/App/DesignSystemPreview/DesignSystemPreview.xcodeproj` from the workspace. Select the **DesignSystemPreview** scheme and an iOS 17 or newer simulator, then click **Run**. For a physical iPhone, select your signing team under **Signing & Capabilities** and use a unique bundle identifier if needed.

For a simulator test, open the hosted website in the simulator's Safari so the download appears in that simulator's Files app.

## Preview the website locally

From this directory, run `python -m http.server 8000 --bind 127.0.0.1` and open `http://127.0.0.1:8000`. No build step or packages are required.

## Publish the website on GitHub Pages

1. Copy the contents of this directory into the root of your repository's `main` branch. Include `.nojekyll`.
2. In **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/ (root)**, and click **Save**.
3. Open the published URL shown in **Settings → Pages**.

[GitHub Pages setup guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
