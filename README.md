<div align="center">
<picture>
    <img src="src/assets/efeenescamci-logo.png" width="30%">
</picture>
</div>
<h1 align="center">
efeenescamci.com
</h1>

### Description

My whatever goes website. Uses the Angular framework and is an SPA. Built as a challenge to experiment with different ideas, and see how differently I could present a personal website.

Has a no-standard-compliant markdown editor component alongside a markdown parser. It's not of much use, but I've never seen a markdown component it in another personal website, so 🤷

Also has a Visual Studio Marketplace component for theming, because why have just a light and dark theme when you can have tens of thousands? Not of much use either, but at least it's fun to play around with.

## Technical Description

### Markdown

There's a lexer and a parser duo; the lexer extracts tokens from text, and the parser interprets the extracted tokens in order, returning a nested set of nodes. A markdown renderer component then goes through the nodes to create the final HTML DOM. Not performant, pretty, or complete.

### Theming

I used Fiddler on Windows to see how VSCode contacts VS Marketplace. VS Marketplace API is pretty good and straightforward; wasn't much of a challenge to create a basic API consumer at all. JSZip is loaded just before trying to download a VSCode theme for the first time. After loaded, it unzips the theme in memory, and after parsing the theme manifest, takes a few primary colors from all variants included. Applies the theme's first variant's extracted colors as the theme, then saves the color schemes of all other variants in local storage. It is possible to switch between variants of the downloaded theme at any time.

### Deployment

I've got a GitHub Actions runner set up on my VPS that, after a push to the master branch, executes a couple of commands to build the site and move it to /var/www/. Not a great idea.
