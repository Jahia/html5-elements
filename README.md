# HTML5 Elements
This module allows you to add HTML 5 elements to your page.
## List of elements:
Here is the list of HTML 5 Elements you can add:
 * **article** The `<article>` tag is used to represent an article. More specifically, the content within the `<article>` tag is independent of the other content on the site (even though it could be related); its contents could stand alone, for example in syndication.

 * **address** The `<address>` tag provides contact information for the nearest `<article>` or `<body>` ancestor.

 * **aside** The `<article>` tag can be used for any of the following: forum post, blog entry, magazine article, newspaper article, user comment, or an independent content item.

 * **div** The `<div>` tag defines a generic container in a document that is generally used to group elements.

 * **figcaption** The `<figcaption>` tag is used to provide a caption when using the `<figure>` tag.

 * **figure** The `<figure>` tag is used for annotating illustrations, diagrams, photos, code listings, etc. You can use the `<figure>` element in conjunction with the `<figcaption>` element to provide a caption for the contents of your `<figure>` element.

 * **footer** The `<footer>` tag defines a footer usually containing copyright or author information in the document.

 * **header** The `<header>` tag defines a header usually containing logo, search form, and introductory information in the document.

 * **hgroup** The `<hgroup>` tag is used for defining the heading of a document or section. More specifically, it is used to group a set of `<h1>` - `<h6>` elements when the heading has multiple levels, such as subheadings, alternative titles, or taglines.

 * **main** The `<main>` tag defines the main content in the document and there should only be one `<main>` element in a document.

 * **nav** The `<nav>` tag defines a section with navigation links in the document.

 * **section** The `<section>` tag defines a generic section in the document.

## Customize
There is a way to customize all HTML5 Elements tag:
* **Aria** allow you to add an `aria-label` in your element to provide an invisible label where a visible label cannot be used. Example: `<article aria-label="Article about Guitars">`
 
* **CSS Class** allows you to add custom CSS class in your elements. Example: `<div class="myCustomClass">`

* **ID** will set a custom ID on your HTML element. Example: `<aside id="advertisement">`

* **Role** Will ensure that user agents that don't support HTML5 can also understand the structure. Example: `<article role="contentinfo" aria-label="Article about Guitars">`
 
* **Style** Allows you to add inline style in your tag. Example: `<div style="padding:10px;background-color:e9e9e9">`

* **Number of elements** allows you to limit the number of elements that you can add to the generated area. For instance, if the value is set to `2` then the button _Add any content_ that you see in edit mode or page composer will be hidden if the list has already 2 sub-nodes. 

## Add data attribute
This module allows you to add 3 data attributes. This option is accessible in the _option_ tab. To add a data attribute, you need to check the _Add data attribute_ mixin then add a name for your attribute and a value.
For instance if `name` is `animal-type` and `value` is `bird` then the generate code for a section element will be `<section data-animal-type="bird">`.

