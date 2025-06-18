# Deploying the Global Weather App to Netlify

This guide will help you deploy the Global Weather App to Netlify for free.

## Prerequisites

- A GitHub account (you already have this since the code is in your repository)
- A Netlify account (free tier is sufficient)

## Deployment Steps

### 1. Sign up for Netlify

If you don't already have a Netlify account:

1. Go to [netlify.com](https://www.netlify.com/)
2. Click "Sign up"
3. Choose to sign up with your GitHub account for easier integration

### 2. Deploy from GitHub

1. Log in to your Netlify account
2. Click "Add new site" > "Import an existing project"
3. Select "Deploy with GitHub"
4. Authorize Netlify to access your GitHub repositories if prompted
5. Select your repository: `iamnubio/MOTOSIM`
6. Configure the deployment settings:
   - Branch to deploy: `main`
   - Base directory: `weather-app`
   - Build command: (leave blank as this is a static site)
   - Publish directory: `weather-app`
7. Click "Deploy site"

### 3. Configure Site Settings (Optional)

After deployment, you can:

1. Change the site name: Site settings > Site details > Change site name
2. Add a custom domain: Site settings > Domain management > Add custom domain

### 4. Verify Deployment

1. Once deployment is complete, Netlify will provide you with a URL (e.g., `https://your-site-name.netlify.app`)
2. Visit the URL to ensure your weather app is working correctly
3. Test the search functionality and other features

## Troubleshooting

If you encounter any issues:

1. Check the Netlify deployment logs for errors
2. Ensure all file paths in your HTML, CSS, and JavaScript files are relative paths
3. Verify that all API requests are using HTTPS (not HTTP)

## Continuous Deployment

Netlify automatically sets up continuous deployment. Any changes pushed to your GitHub repository will trigger a new deployment.
