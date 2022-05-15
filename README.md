# Notes
Manage notes through markdown-written web pages

See below for examples of page structures.  Content can be written as markdown
(I use `showdown` for conversion to `HTML`).

I put all my pages in a directory called `pages`, but there is nothing special
about the name.

## Build

I'll create a proper build process soon, but for now just note that you need to
install the files listed in `.gitignore` for the `js`, `css`, `font` and `img`
directories.

## Example bookmarks page

```
<!doctype HTML>
<html>
    <head>
        <title>Bookmarks</title>
        <link rel=StyleSheet href="../css/bookmarks.css" type="text/css" />
        <link href='../css/roboto.css' rel='stylesheet' type='text/css' />
        <script src="../js/showdown.min.js" type="text/javascript" charset="utf-8"></script>
    </head>
    <body>
        <header>
            <h1>Bookmarks</h1>
        </header>
        <div id="content">
            <pre id="markdown">

## Section heading
- [Example link](https://example.com)

            </pre>
        </div>
        <script src="../js/convert-markdown.js" type="text/javascript" charset="utf-8"></script>
    </body>
</html>
```

## Example notes page

```
<!doctype HTML>
<html>
    <head>
        <title>Some Notes</title>
        <link rel=StyleSheet href="../../../css/notes.css" type="text/css" />
        <link href='../../../css/roboto.css' rel='stylesheet' type='text/css' />
        <script src="../../../js/showdown.min.js" type="text/javascript" charset="utf-8"></script>
    </head>
    <body>
        <header>
            <h1>Some Notes</h1>
        </header>
        <div id="content">
            <pre id="markdown">

## Markdown goes here

            </pre>
        </div>
        <script src="../../../js/convert-markdown.js" type="text/javascript" charset="utf-8"></script>
    </body>
</html>
```
