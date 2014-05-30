jquery.scrollless
===============

jquery.scrollless plugin allows to gain total control over web page scrolling (as well as everything related to document navigation). This is implemented by replacing browser's native scrolling with "block-wise" alternative. "Block-wise" scrolling implies splitting the main content of a web page into smaller pieces ("blocks") each of them will be either displayed entirely or hidden.

[Demos](http://demos.savreen.com/scrollless/demo.html)


Features
-------------
* Responsive. The plugin automatically make visible area of the main content (called "viewport") always to fit to the current window dimensions so native scrollbars have no chance to appear.
* Auto-disabling and auto-restoring. These features are related to the previous one. It means that the plugin listening for any resize event and automatically disabled when block-wise rendering cannot be applied (i.e. when there is a block which doesn't fit to window) and restored once such rendering become available.
* Extensible. From the UI point jquery.scrollless alone has very poor functionality resulted to the features above and it doesn't provide any kind of navigation through a document. However this functionality can be extended via plugins (extensions). jquery.scrollless is bundled with several plugins which adds navigation features as well as keyboard control. Their functionality is enough to build quite rich UI. However you can write your own plugins using one of the default plugins as a sample.
* Customizable. The plugin has set of options which can be used to customize its behaviour.


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


API
-------------
jquery.scrollless provides API - the set of methods which can be used to implement interaction between jquery.scrollless and its plugins as well as main web application. Below is the list of available API methods.

### setPos
Set position of viewport

``` javascript
setPos(pos)
```
or
``` javascript
setPos(posInfo)
```

**Parameters**:

* `pos` (`Number`) or `posInfo.pos` (`Object`) - desired starting block of viewport
* `posInfo.left` (`Number`) - left limit for starting block
* `posInfo.right` (`Number`) - right limit for ending block

### disable
Force disabling of jquery.scrollless

``` javascript
disable()
```

### on
Attach callback for jquery.scrollless event (see **Events** section).

``` javascript
on(eventName, eventCallback)
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
Triggered before jquery.scrollless is applying. Intended for use in plugins. A plugin should have callback for this event if it goes to modify document structure (e.g. add new elements).

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
* `sizeInfo.fixed` (`Boolean`) - if sizing process is completed (`true`) or not (`false`)



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
