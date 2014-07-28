jquery.scrollless
===============

jquery.scrollless plugin allows to gain total control over web page scrolling (as well as everything related to document navigation). This is implemented by replacing browser's native scrolling with "block-wise" rendering. "Block-wise" rendering implies splitting the main content of a web page into smaller pieces ("blocks") each of them will be either displayed entirely or hidden.

[Demos](http://demos.savreen.com/scrollless/demo.html)


Features
-------------
* Responsive. The plugin automatically make visible area of the main content (called "viewport") always to fit to the current window dimensions so native scrollbars have no chance to appear.
* Auto-disabling and auto-restoring. These features are related to the previous one. It means that the plugin listening for any resize event and automatically disabled when block-wise rendering cannot be applied (i.e. when there is a block which doesn't fit to window) and restored once such rendering become available.
* Extensible. From the UI point jquery.scrollless alone has very poor functionality resulted to the features above and it doesn't provide any kind of navigation through a document. However this functionality can be extended via plugins (extensions). jquery.scrollless is bundled with several plugins which adds navigation features as well as keyboard control. Their functionality is enough to build quite rich UI. However you can write your own plugins using one of the bundled plugins as a sample.
* Customizable. The plugin has set of options which can be used to customize its behaviour.
* Animation support. The plugin support custom animation effects applied whenever viewport position is changed.


Dependencies
-------------
The only dependency is [jQuery library](http://jquery.com/) v. 1.7+.


Prerequisites
-------------
jquery.scrollless requires that the main content of a web page doesn't contain dynamic elements i.e. elements which structure or dimensions may be changed after page (document) load. Otherwise proper work of the plugin is not guaranteed. This requirement also means that each media resource on web page (such as image or video) should have explicit dimensions (width/height) defined.


Basic Usage
-------------
First include jQuery library followed by jquery.scrollless plugin (as well as its extensions if any) on your HTML document:

```
<script type="text/javascript" src="/path/to/jquery.js"></script> 
<script type="text/javascript" src="/path/to/jquery.scrollless.js"></script> 
```

Apply jquery.scrollless on your main container (DOM element containing the main content) using jQuery syntax:

``` javascript
$(document).ready(function() {
    $('#container').scrollless();
});
```

Advanced Note: *Applying* doesn't mean *instantiation*. Whenever jquery.scrollless is applying there is no new object (instance) created. Instead, the static pre-created object is used. The same object will be used in all subsequent applying calls. Furthermore, the same container element is used in all applying calls. It means that when you first apply jquery.scrollless on some container the latter (reference to this) will be stored in memory so every subsequent applying call will deal with the same stored container even if this call is doing on another container.


### Options
jquery.scrollless can be applied with custom configuration options using the following syntax:

``` javascript
$('#container').scrollless(options);
```

`options` is an object which may contain the following properties:

* `position` - initial position of viewport. Current viewport position can be obtained through `changePos` event (see **Events** section).
* `itemQuota` - upper limit of block height. May be absolute (&gt; 1) or relative value (&lt; 1).
* `itemNestDepth` - maximum depth of nested blocks.
* `autoRestore` - enable/disable auto-restoring feature (`true` by default).
* `fnAnimate` - callback function has to be called to start custom animation. If not provided, the default animation (hide/show) will be applied. If provided, gets passed one argument - object containing these properties:
  1. startPrev - start of the previous viewport.
  2. endPrev - end of the previous viewport.
  3. start - start of the current viewport.
  4. end - end of the current viewport.
  5. height - available height for the container.
* `fnAnimateEnd` - callback function has to be called to end custom animation. Received no arguments.


Bundled Plugins
-------------
As mentioned above jquery.scrollless is bundled with several plugins which can be used to build UI of web application. Below is the list of these plugins.

* **jquery.scrollless.pagenav** - adds page navigation (pagination) feature (horizontal bar that will appear at the top of the main content). "Page" here is a logical unit which have no relation to how this will be displayed in browser. The main content is divided into pages by combination of two methods:
  1. page-break - special CSS class in document markup ("pagenav-break" by default, may be changed through options) which indicate begining of a new page.
  2. page quota - maximum number of characters per page (2000 by default). This method is used by default (if there is no page-break in markup).
* **jquery.scrollless.affixnav** - Twitter Bootstrap's [Affix plugin](http://getbootstrap.com/javascript/#affix) counterpart. Unlike the original plugin it automatically generate list of headers in the contents sidebar. Each header of the main content you want to appear in the contents sidebar should have special CSS class ("affixnav-header" by default, may be changed through options)
* **jquery.scrollless.scrollbar** - adds custom vertical scrollbar (at the right side of the main content). Requires jquery.scrollless.affixnav plugin to be included first. Note that drag-n-drop actions are not allowed.
* **jquery.scrollless.animbyscroll** - implements custom animation: emulates scrolling effect on viewport position update.
* **jquery.scrollless.keyctrl** - emulates browsers' keyboard control as well as mouse wheel control (optionally).
* **jquery.scrollless.tapctrl** - emulates e-book readers' tap control (like in Nook Simple Touch).


API
-------------
jquery.scrollless provides API - the set of methods which can be used to implement interaction between jquery.scrollless and its plugins as well as main web application. API methods are accessible through the static object jquery.scrollless. Below is the list of these methods.

### setPos
Set/update position of viewport

**Syntax**:
``` javascript
jquery.scrollless.setPos(pos)
```
or
``` javascript
jquery.scrollless.setPos(posInfo)
```

**Parameters**:

* `pos` (`Number`) or `posInfo.pos` (`Object`) - desired starting block of viewport
* `posInfo.left` (`Number`) - left limit for starting block
* `posInfo.right` (`Number`) - right limit for ending block

### setPosComplete
Perform all actions needed to complete setting/updating position of viewport. Intended for use in custom animation plugins

**Syntax**:
``` javascript
jquery.scrollless.setPosComplete()
```

### disable
Force disabling of jquery.scrollless

**Syntax**:
``` javascript
jquery.scrollless.disable()
```

### on
Attach callback for jquery.scrollless event (see **Events** section).

**Syntax**:
``` javascript
jquery.scrollless.on(eventName, eventCallback)
```

**Parameters**:

* `eventName` (`String`) - event name
* `eventCallback` (`Function`) - callback to be attached to event

**Returns**:

* jquery.scrollless object for use in jQuery call chains


Events
-------------
jquery.scrollless trigger the following custom events which may be bound with callback functions:

* preInit
* postInit
* disable
* changePos
* changeSize

### preInit
Triggered before jquery.scrollless is applying. Intended for use in plugins. A plugin should have callback for this event if it going to modify document structure (e.g. add new elements).

**Callback declaration**:
```
/**
 * @param Object options
 */
function callback(options) {...}
```

* `options` - object containing configuration options

**Context**:
Inside callback `this` is jQuery object referring to the container element. You can use `this` for DOM structure modification.

### postInit
Triggered after jquery.scrollless is applying. Intended for use in plugins. Allows to learn which children elements of the container are treated as "blocks" by the plugin.

**Callback declaration**:
```
/**
 * @param Array items
 */
function callback(items) {...}
```

* `items` - set of the block elements (references)

### disable
Triggered when jquery.scrollless is disabled.

**Callback declaration**:
```
function callback() {...}
```

### changePos
Triggered when position of viewport is changed. 

**Callback declaration**:
```
/**
 * @param Object posInfo
 */
function callback(posInfo) {...}
```

* `posInfo.start` (`Number`) - starting block of viewport
* `posInfo.end` (`Number`) - ending block of viewport

### changeSize
Triggered on any resize event. Intended for use in plugins.

**Callback declaration**:
```
/**
 * @param Object sizeInfo
 */
function callback(sizeInfo) {...}
```

* `sizeInfo.height` (`Number`) - available (maximum) height for the container
* `sizeInfo.sizing` (`Boolean`) - indicate that sizing is in process (not finished)



Browser Compatibility
-------------
Currently jquery.scrollless is tested in the following browsers:
* Firefox 3+
* Chrome
* Opera 9+
* IE8+
* Chrome for Android (Nexus)


License
-------------
* [GPL v2](http://opensource.org/licenses/GPL-2.0)
