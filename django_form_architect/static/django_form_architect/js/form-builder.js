/** inheritance helper **/
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
 
    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();
/** end inheritance helper **/

/** csrf support for django **/
$.ajaxSetup({ 
    beforeSend: function(xhr, settings) {
        function getCookie(name) {
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
        }
        if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
            // Only send the token to relative URLs i.e. locally.
            xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        }
    } 
});
/** end csrf support for django **/

var dfb = {} || dfb;

/* context menu that shows up when a form item has been selected */
dfb.ContextMenu = function() {
	
	this.active_object = null;
	this.$slide = null;
	
	this.render = function(template_selector, container_selector) {
		this.$html = $($.templates(template_selector).render(getTemplateData.call(this)));
		this.$slide = this.$html.find('.jq-slide');
		return this.$html;		
	}
	
	this.setActiveObject = function(widget) {
		this.active_object = widget;
		$('#form-builder-fields .widget-wrap').removeClass('active');
		widget.$html.closest('.widget-wrap').addClass('active');		
		return this;
	}
	
	this.getActiveObject = function() {
		return this.active_object;
	}
	
	this.displayMenu = function($menu) {
		this.$slide			
			.show()
			.find('.jq-slide-content')
			.html($menu);
		this.positionMenuAtActive();
		return this;
	}
	
	this.hideCurrentMenu = function() {
		this.$slide.hide();
	}
	
	this.hideIfActive = function(widget) {
		if(this.active_object === widget) {
			this.$slide.fadeOut('fast');
		}
	}
	
	this.positionMenuAtActive = function(suppress_animation) {
		if(this.active_object) {
			this.positionMenuAt(this.active_object.getElement().closest('.widget-wrap').position().top+20, suppress_animation);
		}
	}
	
	this.positionMenuAt = function(offset, suppress_animation) {
		suppress_animation = false;
		if(!suppress_animation) {
			this.$slide
				.stop()
				.animate({
					'margin-top' : (offset) + 'px'
				}, 300);
		}else{
			this.$slide
				.css({
					'margin-top' : (offset) + 'px'
				}, 300);
		}
	}
	
	var getTemplateData = function() {
		return {};
	}
	
};

dfb.FormBuilder = function(options) {
	
	this.settings = $.extend({}, {
		pid: null,
		header: null,
		description: null,
	}, options);
	
	this.render = function(template_selector, container_selector) {	
		var _this = this;
		this.$html = $($.templates(template_selector).render(getTemplateData.call(this)));
		this.$html
			.find('.jq-form-title')
			.editabletext({
				custom_text_class: 'editable-form-title'
			});		
		this.$html
			.find('.jq-form-description')
			.editabletext({
				custom_text_class: 'editable-form-description',
				textarea_mode: true,
			});
		this.$html
			.find('#save-button')
			.click(function() {
				_this.save.call(_this);
				return false;
			});
		var is_dragging_active = false;
		this.$html
			.find('#form-builder-fields')			
			.droppable({
				accept: ":not(.ui-sortable-helper)", /* so sorting doesn't trigger this */				
			})			
			.sortable({
				axis: 'y',
				distance: 20,
				connectWith: '.form-element',
				placeholder: 'ui-form-element-placeholder',
				stop: function(evt, ui) {
					is_dragging_active = false;
					if(!ui.item.data().initialized) {
						ui.item.attr('id', null);
						ui.item.attr('class', 'widget-wrap pageable');
						loadDroppedWidget.call(_this, ui.item);						
					}
					
					dfb_globals.context_menu.positionMenuAtActive(true);
					ui.item.find('.widget').data('widget').onDragStop();					
				},
				start: function(evt, ui){
					if(dfb_globals.context_menu.getActiveObject() == ui.item.find('.widget').data('widget')) {
						is_dragging_active = true;
					}
			        ui.placeholder.height(ui.helper.outerHeight());
			    },
			    change: function(evt, ui) {
					dfb_globals.context_menu.positionMenuAtActive(true);					
				},				
			})
			.on('mousemove', function(evt) {
				if(is_dragging_active) {
					$placeholder = $('#form-builder-fields .ui-form-element-placeholder');
					if($placeholder.length > 0) {
						dfb_globals.context_menu.positionMenuAtActive();
					}
				}
			})
			.disableSelection();
		this.$html.find('#pagination-tabs div.jq-add-page').on('click', function() {			
			var page = dfb_globals.builder.addPage({
				pid: null,
				name: 'New Page',
				selected: false
			});
		});	
		this.$html.find('#pagination-settings .jq-toggle').on('click', function() {
			_this.getCurrentPage().toggleSettings();
		});
		this.getCurrentPage();
		
		return this.$html;		
	};
	
	this.addPage = function(options) {
		var page = new dfb.WidgetPage(options);
		var $page_element = page.render();
		this.$html
			.find('#pagination-tabs .jq-add-page')
			.before($page_element);
		
		return page;
	};
	
	this.getCurrentPage = function() {
		var $page = $('#pagination-tabs div.selected');
		var page = null;
		
		if($page.length > 0) {			
			page = $page.data().page;
		}
		
		return page;
	};
	
	this.save = function() {
		dfb.ui.showWaiter();
				
		var _this = this;				
		var form = {
			'pid': $('#form-pid').val(),
			'title': $.trim($('#form-title').text()),
			'description': $.trim($('#form-description').html())
		};
		
		var pages = [];		
		var page_sequence = 0;
		$('#pagination-tabs .page').each(function() {
			var page = $(this).data().page;
			var widgets = [];
			page.syncWidgetSequence();			
			
			var widget_sequence = 0;
			for(i=0;i<page.widgets.length;i++) {
				var configurables = page.widgets[i].exportConfigurables();
				configurables['sequence'] = widget_sequence++;
				widgets.push(configurables);				
			}
			pages.push({
				pid: page.getPid(),
				sequence: page_sequence++,
				name: page.getPageName(),
				widgets: widgets
			});
		});
		
		$.post('.',{
			'pages': JSON.stringify(pages),
			'form': JSON.stringify(form),			
		}).done(function(result) {
			$('#form-pid').val(result.form_pid);
			var errors = [];
			$('#pagination-tabs .page').each(function(i) {
				var page = $(this).data().page;
				if(result.page_map[i]) {
					page.setPid(result.page_map[i]['pid']);
					for(j=0;j<page.widgets.length;j++) {
						var widget = page.widgets[j];
						if(!result.page_map[i].widgets[j]) {
							errors.push('A widget of type ' + widget.settings.child_type + ' was not saved properly');
						}
						widget.setPid(result.page_map[i].widgets[j]);
					}
				}
			});
			
			var window_content = 'Your form was saved successfully!';
			if(errors.length > 0) {
				window_content = 'There were errors saving your form.<ul>';
				for(i=0;i<errors.length;i++) {
					window_content += '<li>' + errors[i] + '</li>';
				}
				window_content += '</ul>';
			}
			var window = new dfb.ui.Window({
				content: window_content,
				border_type: (errors.length > 0) ? 'failure' : 'success',
			});
			window.show();
			setTimeout(function(){window.remove()}, 5000);			
		}).fail(function() {
			var window = new dfb.ui.Window({
				content: 'There was a server error when trying to save your form',
				border_type: 'failure'
			});
			window.show();			
			setTimeout(function(){window.remove()}, 10000);
		}).always(function() {
			dfb.ui.hideWaiter();
		});						
	}
	
	/** adds a widget to the current page **/
	this.addWidget = function(widget_type_string, template_selector, options) {
		$('#form-builder-fields').removeClass('no-items');
		var $widget_container = $("<div class='widget-wrap pageable'></div>");
		$widget_container.data('initialized', true);
		
		var $widget_element = dfb.widgets.WidgetFactory.createElement(widget_type_string, template_selector, options);		
		$widget_container.html($widget_element);	
		$widget_container.click(function() {
			$widget_element.data().widget.showContextMenu();
		});
		$('#form-builder-fields').append($widget_container);
		var widget = $widget_element.data().widget;
		this.getCurrentPage().addWidget(widget);
		
		return widget;
	}
	
	this.replaceWidget = function(widget, new_type, template, options) {
		var $container = widget.$html.closest('.widget-wrap');
		widget.$html.remove();
		this.getCurrentPage().removeWidget(widget);
		
		var $widget_element = dfb.widgets.WidgetFactory.createElement(new_type, template, options);
		$container.html($widget_element);
		
		this.getCurrentPage().addWidget($widget_element.data().widget);
		$widget_element.data().widget.showContextMenu();
		$container
			.unbind('click') /* remove click from addWidget or loadDroppedWidget */
			.click(function() {
				$widget_element.data().widget.showContextMenu();
			});		
	}
	
	this.removeWidget = function(widget) {
		var $container = widget.$html.closest('.widget-wrap');
		this.getCurrentPage().removeWidget(widget);
		$container.fadeOut('fast', function() {
			$(this).remove();			
		});
		window.dfb_globals.context_menu.hideIfActive(widget);
	};
	
	this.duplicateWidget = function(widget) {
		var configurables = widget.exportConfigurables();
		delete configurables['pid'];
		var new_widget = this.addWidget(widget.settings.child_type, widget.template_selector, configurables);		
		new_widget.showContextMenu();
	}
	
	var getTemplateData = function() {
		return this.settings;
	};
	
	var loadDroppedWidget = function($container) {
		$('#form-builder-fields').removeClass('no-items');
		$container.data('initialized', true);	

		var $widget_element = dfb.widgets.WidgetFactory.createElement($container.data().widgetType, $container.data().templateSelector, $container.data());
		this.getCurrentPage().addWidget($widget_element.data().widget);
		$container.html($widget_element);
		$container.click(function() {		
			$widget_element.data().widget.showContextMenu();
		});
	}
	
};

dfb.WidgetPage = function(options) {
	this.settings = $.extend({}, {
		pid: null,
		name: 'Page',
		template_selector: '#widget-page',
		selected: false
	}, options);
	
	this.widgets = [];
	
	this.getPid = function() {
		return this.settings.pid;
	};
	
	this.setPid = function(value) {
		this.settings.pid = value;
	};
	
	this.syncWidgetSequence = function() {
		var new_widget_list = [];
		var _this = this;
		$('#form-builder-fields div.widget').each(function(){
			var widget = $(this).data().widget;
			if(_this.widgets.indexOf(widget) > -1) {
				new_widget_list.push(widget);
			}
		});
		_this.widgets = new_widget_list;
	};
	
	this.render = function() {
		this.$html = $($.templates(this.settings.template_selector).render(getTemplateData.call(this)));
		this.$html.data('page', this);
		var _this = this;
		this.$html.on('click', function() {
			_this.showPage();
		});		
		this.$html.droppable({
			tolerance: 'pointer',
			hoverClass: 'ui-state-hover',
			accept: '.pageable',
			drop: function(evt, ui) {				
				var widget = ui.draggable.find('.widget').data().widget;
				dfb_globals.builder.getCurrentPage().moveWidgetTo(widget, _this);
				window.dfb_globals.context_menu.hideIfActive(widget);
			}
		});
		if(this.settings.selected) {
			this.$html.droppable('disable');
		}
		var $settings = $('#pagination-settings .jq-settings');
		if(!$settings.data().initialized) {
			$settings.find('.jq-page-name')
				.bind('keydown', function(evt) {
					if(evt.which == 13 /* enter key */) {
						evt.preventDefault();
					}else if(evt.which == 27) /* escape key */ {
						evt.preventDefault();
						evt.stopPropagation();					
					}				
				})
				.bind('keyup', function() {
					dfb_globals.builder.getCurrentPage().setPageName(window.htmlEncode($(this).val()));
				});
			$('#pagination-settings .jq-delete-page').bind('click', function() {
				dfb_globals.builder.getCurrentPage().removePage();
			});
			$settings.data('initialized', true);
		}
		return this.$html;
	};

	this.showPage = function() {
		if(this.$html.hasClass('selected')) return;
		
		this.setSettings();
		dfb_globals.context_menu.hideCurrentMenu();
		$('#pagination-tabs').find('.page')
			.removeClass('selected')
			.droppable('enable');
		$('#form-builder div.widget').each(function() {
			$(this).data().widget.hide();
		});
		for(i=0;i<this.widgets.length;i++) {
			this.widgets[i].show();
		}
		this.$html.droppable('disable');
		this.$html.addClass('selected');		
	};
	
	this.removePage = function() {
		//all the widgets need to get moved to another page, choose the previous page unless
		//this is the first page, then choose the next one.  If there is only one page deletion is not allowed.
		var siblings_cnt = this.$html.siblings('.page').length;
		if(siblings_cnt == 0) {
			var window = new dfb.ui.Window({
				content: "You must have at least one page.",
				border_type: 'failure',
			});
			window.show();
			setTimeout(function(){window.remove()}, 5000);
		}else{
			var $target = this.$html.prev('.page');
			if($target.length == 0) {
				$target = this.$html.next('.page');
			}
			var target_page = $target.data().page;
			for(i=0;i<this.widgets.length;i++) {
				target_page.addWidget(this.widgets[i]);
			}
			this.$html.fadeOut(function() {
				$(this).remove();
				target_page.showPage();
			})
		}
	};
	
	this.addWidget = function(widget) {
		this.widgets.push(widget);
	};
	
	this.moveWidgetTo = function(widget, page) {
		if(page.$html.hasClass('selected')) return;
		
		widget.hide();
		this.removeWidget(widget);
		page.addWidget(widget);
	};
	
	this.hideSettings = function() {		
		var $toggle = $('#pagination-settings .jq-toggle');
		var $settings = $('#pagination-settings .jq-settings');
		$toggle.addClass('collapsed').removeClass('expanded');
		$settings.slideUp('fast', function() {
			dfb_globals.context_menu.positionMenuAtActive(true);
		});
	};
	
	this.setSettings = function() {
		var $settings = $('#pagination-settings .jq-settings');
		$settings.find('.jq-page-name').val(this.getPageName());
	};
	
	this.toggleSettings = function() {
		var $toggle = $('#pagination-settings .jq-toggle');
		var $settings = $('#pagination-settings .jq-settings');
		var showing = $toggle.hasClass('expanded');
		if(!showing) {
			$toggle.addClass('expanded').removeClass('collapsed');
			$settings.slideDown('fast', function() {
				dfb_globals.context_menu.positionMenuAtActive(true);
			});
			this.setSettings();
		}else{
			this.hideSettings();
		}				
	};
	
	this.removeWidget = function(widget) {
		var index = this.widgets.indexOf(widget);
		if(index > -1) {
			this.widgets.splice(index, 1);
		}
	};
	
	this.setPageName = function(value) {
		this.$html.html(value);
	};
	
	this.getPageName = function() {
		return $.trim(this.$html.text());
	}
	
	var getTemplateData = function() {
		return this.settings;
	};
	
};

dfb.ElementSelector = function(options) {
	this.settings = $.extend({}, {
		/* placeholder */
	}, options);
	
	this.render = function(template_selector, container_selector) {
		var _this = this;
		this.$html = $($.templates(template_selector).render(getTemplateData.call(this)));	
		this.positionSelector();
		$(window).resize(function() {
			_this.positionSelector();
		});
		this.$html.show();
		
		this.$html.find('.form-element')
			.draggable({
				distance: 20,
				cursor: 'move',
				appendTo: 'body',
				/*helper: 'clone',*/
				helper: function(evt) {
					return $("<div class='cloned-form-element' style='width:300px;height:50px;'></div>");
				},
				stop: function(evt, ui) { 
					$(evt.toElement).one('click', function(e){ e.stopImmediatePropagation(); } ); //stop click event from firing					
				},
				connectToSortable: '#form-builder-fields',				
			})
			.click(function() {
				dfb_globals.builder.addWidget($(this).data().widgetType, $(this).data().templateSelector);
			});			
		
		return this.$html;		
	}
	
	this.positionSelector = function() {
		this.$html.css({'left' : ($(window).width()/2 + $('#main-content').outerWidth()/2) + 'px'});
	}
	
	var getTemplateData = function() {
		return {};
	}
};

/** widgets **/
dfb.widgets = dfb.widgets || {};

dfb.widgets.WidgetFactory = {	
	uID: 0,
	getNextUID: function() {
		return this.uID++;
	},
	createElement: function(type_string, template_selector, options) {
		if(!options) {
			var options = {};
		}
		options.uID = this.getNextUID();
		var widget_type = window.getFunctionFromString(type_string);
		var widget = new widget_type(options);
		var $widget_html = $(widget.renderToString(template_selector))		
		$widget_html.data('widget', widget);
		$widget_html.find('div.jq-remove-widget').on('click', function(evt) {
			evt.stopPropagation();
			window.dfb_globals.builder.removeWidget(widget);
		});
		$widget_html.find('div.jq-duplicate-widget').on('click', function(evt) {
			evt.stopPropagation();
			window.dfb_globals.builder.duplicateWidget(widget);
		});
		
		return $widget_html;
	},	
};

dfb.widgets.WidgetBase = Class.extend({
	init: function(options) {		
		this.settings = $.extend({}, {
			context_menu_template_selector : '#base-context-menu-template',
			pid : null
		}, options);
		this.$html = null;
		this.template_selector = null;
	},
	renderToString: function(template_selector) {
		this.template_selector = template_selector;
		this.$html = $($.templates(template_selector).render(this.getTemplateData()));		
		this.$controls = $($.templates('#widget-controls').render({}));		
		return $([this.$controls[0], this.$html[0]]);
	},
	setPid: function(value) {
		this.settings.pid = value;
	},
	onDragStop: function() {},
	getElement: function() {
		return this.$html;
	},
	getTemplateData: function() {		
		return this.settings;
	},
	getContextMenuTemplateData: function() {		
		return this.exportConfigurables();
	},
	//refreshes the widget for options that are difficult or annoying to redraw properly.
	//also reshows the context menu to re-wire events.
	redrawWith: function(configurables) {
		var $widget_html = $($.templates(this.template_selector).render(configurables));
		var $wrap = $(this.$html.parent());
		this.$html.remove();
		$wrap.append($widget_html);					
		this.$html = $widget_html;
		this.showContextMenu();
	},
	show: function() {
		this.$html.parent().fadeIn('fast');
	},
	hide: function() {
		this.$html.parent().hide();
	},
	showContextMenu: function() {
		var $context_menu = $($.templates(this.settings.context_menu_template_selector).render(this.getContextMenuTemplateData()));
		var _this = this;
		$.each(this.settings.configurables, function() {	
			var camel_cased = this.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase() }); 
			var method = camel_cased.charAt(0).toUpperCase() + camel_cased.slice(1);
			var helper_method = _this['cmh_wireUp' + method];			
			helper_method.call(_this, $context_menu);
		});
		
		dfb_globals.context_menu
			.setActiveObject(this)			
			.displayMenu($context_menu);
	},
	exportConfigurables: function() {
		var _this = this;
		var configurables = {
			pid: this.settings.pid
		};
		$.each(this.settings.configurables, function() {
			var camel_cased = this.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase() }); 
			var method = camel_cased.charAt(0).toUpperCase() + camel_cased.slice(1);
			
			var helper_method = _this['cmh_export' + method];			
			configurables[this] = helper_method.call(_this);			
		});
				
		return configurables;
	},
	setContentTypeDisplay: function(cType) {	
		var _this = this;
		if(!cType) {
			var cType = this.cmh_exportContentType();
		}
		var elementId = 'input-' + this.settings.uID;
				
		switch(cType) {
			case 'text': 
				this.getElement().find('.richtext-cover').hide();
				$('#' + elementId).show();
				break;
			case 'richtext':
				this.getElement().find('.richtext-cover').show();
				$('#' + elementId).hide();
				break;
		}		
	},	
	cmh_wireUpType: function($context_menu) {
		var _this = this;		
		$context_menu.find('.jq-header option[value="' + this.settings.child_type + '"]').prop('selected', true);
		$context_menu.find('.jq-header')			
			.change(function() {
				var $this = $(this);
				var replaceWidget = function() {
					dfb_globals.builder.replaceWidget(_this, $this.val(), $this.find('option:selected').data().templateSelector /* todo, maybe get settings? */);
				};				
				if(_this.settings.pid) {
					dfb.ui.Window.showYesNoDialog({
						content: "Changing the type is the same as deleting and recreating a field.  You will lose this field's association with old data.  Are you sure you want to change this?",
						yes: replaceWidget,
						no: function() {
							$this.val([_this.settings.child_type]);
						}
					});
				}else{
					replaceWidget();
				}
			});
		
	},
	cmh_exportType: function() {
		return this.settings.child_type;
	},
	cmh_wireUpLabel: function($context_menu) {
		var _this = this;
		var $label = this.getElement().find('.jq-label-text');
		$context_menu.find('.jq-label')		
			.keyup(function() {
				$label.html(window.htmlEncode($(this).val()));
			})
			.val($label.text());		
	},
	cmh_exportLabel: function() {
		return $.trim(this.getElement().find('.jq-label-text').text());
	},
	cmh_wireUpRequired: function($context_menu) {		
		var $label = this.getElement().find('label');
		var $required = $context_menu.find('.jq-required');
		if($label.hasClass('required')) {
			$required[0].checked = true;
		}
		$required.change(function() {
			if($(this).is(':checked')) {
				$label.addClass('required');
			}else{
				$label.removeClass('required');
			}
		})
	},
	cmh_exportRequired: function() {
		return this.getElement().find('label').hasClass('required');
	},
	cmh_wireUpHelpText: function($context_menu) {
		var _this = this;
		var $helptext = this.getElement().find('.jq-help-text');
		$context_menu.find('.jq-help-text')		
			.keyup(function() {
				$helptext.html(window.htmlEncode($(this).val()));
			})
			.val($.trim($helptext.text()));
	},
	cmh_exportHelpText: function() {
		return $.trim(this.getElement().find('.jq-help-text').text());
	},
	cmh_wireUpSize: function($context_menu) {
		var _this = this;
		var $sizable = this.getElement().find('.jq-sizable');
		$context_menu.find('.jq-size option[value="' + $sizable.data().size + '"]').prop('selected', true);
		$context_menu.find('.jq-size')
			.change(function() {				
				$(this).find('option').each(function() {
					$sizable.removeClass($(this).val());
				})
				$sizable					
					.addClass($(this).val())
					.data('size', $(this).val());
				
			});
	},
	cmh_exportSize: function() {
		return this.getElement().find('.jq-sizable').data().size;
	},
	cmh_wireUpDefault: function($context_menu) {
		var _this = this;
		var $defaultable = this.getElement().find('.jq-defaultable');
		$context_menu.find('.jq-default')
			.keyup(function() {
				$defaultable.val($(this).val());
			})
			.val($.trim($defaultable.val()));
	},
	cmh_exportDefault: function() {
		return this.getElement().find('.jq-defaultable').val();
	},
	cmh_wireUpContentType: function($context_menu) {
		var _this = this;
		var $contentTypeInput = this.getElement().find('.jq-configurable-content-type');
		$context_menu.find('.jq-content-type option[value="' + $contentTypeInput.data().contentType + '"]').prop('selected', true);
		$context_menu.find('.jq-content-type')
			.change(function() {
				$contentTypeInput.data('contentType', $(this).val());
				_this.setContentTypeDisplay($(this).val());				
			});
		this.setContentTypeDisplay($contentTypeInput.data().contentType);
	},
	cmh_exportContentType: function() {
		return this.getElement().find('.jq-configurable-content-type').data().contentType;
	},	
});

dfb.widgets.CheckBox = dfb.widgets.WidgetBase.extend({
	init: function(options) {		
		this.settings = $.extend({}, {
			label : 'Favorite activities',
			context_menu_template_selector : '#checkbox-context-menu-template',
			child_type : 'dfb.widgets.CheckBox',
			options : [			  
				{text: 'sleeping', selected: false},
				{text: 'eating', selected: false},
				{text: 'sleep-eating', selected: false}
			],
			configurables: [
				'type',
				'label',
				'required',
				'options',
				'help_text'
			]
		}, options);		
		this._super(this.settings);
	},	
	cmh_wireUpOptions: function($context_menu) {		
		var _this = this;		
		$context_menu.find('.jq-checkbox-options')
			.contextmenuoptions({
				allow_multiple : true,
				on_remove : function(index) {	
					_this.getElement().find('.option-wrap label:nth-child(' + (parseInt(index)+1) + ')').remove();					
				},
				on_add : function() {
					$html = $($.templates('#checkbox-field-template-row').render({}));					
					_this.getElement().find('.option-wrap').append($html);					
				},
				on_index_change : function(index, checked) {					
					_this.getElement().find('.option-wrap label:nth-child(' + (parseInt(index)+1) + ') input').prop('checked', checked);
				},		
				on_text_change : function(index, text) {
					_this.getElement().find('.option-wrap label:nth-child(' + (parseInt(index)+1) + ') span').text(text);					
				}
			}); /*should be configurable selector...*/				
	},
	cmh_exportOptions: function() {
		var options = [];
		$(this.getElement().find('.jq-input')).each(function() {			
			options.push({
				text : $.trim($(this).parent().text()),
				selected : $(this).is(':checked')
			});
		});
		return options;
	}
});

dfb.widgets.RadioButton = dfb.widgets.WidgetBase.extend({
	init: function(options) {		
		this.settings = $.extend({}, {
			label : 'Best Avenger(TM)',
			context_menu_template_selector : '#radiobutton-context-menu-template',
			child_type : 'dfb.widgets.RadioButton',
			options : [			  
				{text: 'Spock', selected: false},
				{text: 'Scrooge McDuck', selected: true},
				{text: 'Superman', selected: false}
			],
			configurables: [
				'type',
				'label',
				'required',
				'options',
				'help_text'
			]
		}, options);		
		this._super(this.settings);
	},	
	cmh_wireUpOptions: function($context_menu) {		
		var _this = this;		
		$context_menu.find('.jq-checkbox-options')
			.contextmenuoptions({
				allow_multiple : false,
				radio_group_name: 'ctx-radiobutton-options',
				on_remove : function(index) {	
					_this.getElement().find('.option-wrap label:nth-child(' + (parseInt(index)+1) + ')').remove();					
				},
				on_add : function() {
					$html = $($.templates('#radiobutton-field-template-row').render({}, {'groupId': _this.settings.uID}));					
					_this.getElement().find('.option-wrap').append($html);					
				},
				on_index_change : function(index, checked) {				
					var selected_value = $context_menu.find('.jq-checkbox-options input[type=radio]:checked').siblings('input[type=text]').val()					
					_this.getElement().find('.option-wrap input').val([selected_value]);
				},		
				on_text_change : function(index, text) {
					_this.getElement().find('.option-wrap label:nth-child(' + (parseInt(index)+1) + ') span').text(text);
					_this.getElement().find('.option-wrap label:nth-child(' + (parseInt(index)+1) + ') input').val(window.htmlEncode(text));
				}
			}); /*should be configurable selector...*/				
	},
	cmh_exportOptions: function() {
		var options = [];
		$(this.getElement().find('.jq-input')).each(function() {			
			options.push({
				text : $.trim($(this).parent().text()),
				selected : $(this).is(':checked')
			});
		});
		return options;
	}
});

dfb.widgets.TextBox = dfb.widgets.WidgetBase.extend({
	init: function(options) {		
		this.settings = $.extend({}, {
			label : 'Pet\'s name',
			context_menu_template_selector : '#textbox-context-menu-template',
			child_type : 'dfb.widgets.TextBox',
			size : 'm',
			configurables: [
				'type',
				'label',
				'required',
				'help_text',
				'size',
				'default'
			]
		}, options);		
		this._super(this.settings);
	}
});

dfb.widgets.SectionBreak = dfb.widgets.WidgetBase.extend({
	init: function(options) {		
		this.settings = $.extend({}, {
			label : 'Section Break',			
			context_menu_template_selector : '#section-break-context-menu-template',
			child_type : 'dfb.widgets.SectionBreak',
			help_text : 'Put your section break info here.',
			configurables: [
				'type',
				'label',				
				'help_text',				
			]
		}, options);		
		this._super(this.settings);
	}
});

dfb.widgets.TextArea = dfb.widgets.WidgetBase.extend({
	init: function(options) {		
		this.settings = $.extend({}, {
			label : 'Tell me all about it',
			content_type : 'text',
			size : 'm',
			context_menu_template_selector : '#textarea-context-menu-template',
			child_type : 'dfb.widgets.TextArea',
			configurables: [
				'type',
				'label',
				'required',
				'help_text',
				'size',
				'default',
				'content_type'
			]
		}, options);		
		this._super(this.settings);
	},	
	onDragStop: function() {		
		this.setContentTypeDisplay();
	}
});

dfb.widgets.DropDown = dfb.widgets.WidgetBase.extend({
	init: function(options) {		
		this.settings = $.extend({}, {
			label : 'Select an option',			
			context_menu_template_selector : '#dropdown-context-menu-template',
			child_type : 'dfb.widgets.DropDown',
			size : 'm',
			options : [
			    {text: '', selected: true},
				{text: 'option 1', selected: false},
				{text: 'option 2', selected: false},
				{text: 'option 3', selected: false}
			],
			configurables: [
				'type',
				'label',
				'required',
				'help_text',
				'size',		
				'options',
			]
		}, options);		
		this._super(this.settings);
	},
	cmh_wireUpOptions: function($context_menu) {		
		var _this = this;
		var $input = this.getElement().find('.jq-input');
		$context_menu.find('.jq-dropdown-options')
			.contextmenuoptions({
				on_remove : function(index) {					
					$input.find('option').eq(index).remove();
				},
				on_add : function() {
					$input.append('<option></option>');
				},
				on_index_change : function(index) {					
					$input.find('option').eq(index).prop('selected', true);
				},		
				on_text_change : function(index, text) {					
					$input.find('option').eq(index)
						.val(text)
						.text(text);
				}
			}); /*should be configurable selector...*/				
	},
	cmh_exportOptions: function() {
		var options = [];
		$(this.getElement().find('.jq-input option')).each(function() {			
			options.push({
				text : $(this).val(),
				selected : $(this).is(':selected')
			});
		});
		return options;
	}
});

dfb.widgets.SelectionTable = dfb.widgets.WidgetBase.extend({
	init: function(options) {		
		this.settings = $.extend({}, {
			label : 'Favorite soda?',			
			context_menu_template_selector : '#selection-table-context-menu-template',
			child_type : 'dfb.widgets.SelectionTable',			
			options : [			    
				{text: 'hate it', selected: false},
				{text: 'meh', selected: true},
				{text: 'love it', selected: false}
			],
			rows : [
			    {text: 'orange', selected: false},
			    {text: 'grape', selected: false},
			    {text: 'lemon-lime', selected: false}
			],
			configurables: [
				'type',
				'label',
				'required',
				'help_text',						
				'options',
				'rows',
			]
		}, options);		
		this._super(this.settings);
	},
	cmh_wireUpOptions: function($context_menu) {		
		var _this = this;
		var $table = this.getElement().find('table.jq-table');
		$context_menu.find('.jq-column-options')
			.contextmenuoptions({				
				on_remove : function(index) {
					$table_column = $table.find('tr>*:nth-child('+ (index+2) +')');
					$table_column.fadeOut('fast', function() {
						$table_column.remove();
					});
				},
				on_add : function() {
					//just recreate the whole table.					
					var configurables = _this.exportConfigurables();
					configurables.options = this.getOptions();
					dfb_globals.builder.replaceWidget(_this, _this.settings.child_type, _this.template_selector, configurables);
				},
				on_index_change : function(index) {					
					$table.find('input[type=radio]').prop('checked', false);
					$table.find('tr td:nth-child(' + (parseInt(index)+2) + ') input[type=radio]').prop('checked', true);
				},		
				on_text_change : function(index, text) {					
					$table.find('tr:first th:eq(' + (index+1) + ')').text(text);
				}
			}); 
	},
	cmh_exportOptions: function() {
		var _this = this;
		var options = [];
		/* only use the second row in the table, which should always exist */
		$(this.getElement().find('table.jq-table tr:eq(1) td:not(:first)')).each(function(index) {			
			options.push({
				text : $.trim(_this.getElement().find('table.jq-table th:nth-child(' + (parseInt(index) + 2) + ')').text()),
				selected : $(this).find('input[type=radio]').is(':checked')
			});
		});
		return options;
	},
	cmh_wireUpRows: function($context_menu) {
		var _this = this;
		var $table = this.getElement().find('table.jq-table');
		$context_menu.find('.jq-row-options')
			.contextmenuoptions({
				allow_selection : false,
				on_remove : function(index) {
					$table_row = $table.find('tr:eq(' + (index+1) + ')');
					$table_row.fadeOut('fast', function() {
						$table_row.remove();
					});
				},
				on_add : function() {
					var $row = $($.templates('#selection-table-row').render({}, {
						index: $context_menu.find('.jq-row-options .option-wrapper').length, 
						options: _this.cmh_exportOptions(),
					}));
					$row.hide();
					$table.append($row.fadeIn('fast'));
				},
				on_index_change : function(index) {					
					
				},		
				on_text_change : function(index, text) {					
					$table.find('tr:eq(' + (index+1) + ') td:first').text(text);
				}
			}); 
	},
	cmh_exportRows: function() {
		var rows = [];
		/* only use the second row in the table, which should always exist */
		$(this.getElement().find('table.jq-table tr:not(:first-child)')).each(function() {			
			rows.push({
				text : $(this).find('td:first').text(),
				selected : false
			});
		});
		return rows;
	},
});

dfb.ui = {
	ui_id_cnt: 1,
	$waiter: null,
	$dialog_overlay: null,
	getUniqueID: function() {
		return this.ui_id_cnt++;
	},
	showWaiter: function() {
		if(!this.$waiter) {
			this.$waiter = $("<div class='ui-waiter'></div>");
			$('body').append(this.$waiter);
		}
		this.$waiter.fadeIn('fast');
	},
	hideWaiter: function() {
		this.$waiter.fadeOut('fast');
	},
	showDialogOverlay: function() {
		if(!this.$dialog_overlay) {
			this.$dialog_overlay = $("<div class='ui-dialog-overlay'></div>");
			$('body').append(this.$dialog_overlay);
		}
		this.$dialog_overlay.fadeIn('fast');
	},
	hideDialogOverlay: function() {
		this.$dialog_overlay.fadeOut('fast');
	}
};

dfb.ui.Window = function(options) {	

	var settings = $.extend({}, {
		animation_type: 'slide_down',	
		template_selector: '#ui-window',
		content: 'default content',
		border_type: 'success',
		show_buttons: false,
		yes: function() { this.remove(); },
		no: function() { this.remove(); },
	}, options);		
	var window_id = dfb.ui.getUniqueID(); 
	var $window = null;
	
	this.show = function() {
		if(!this.$window) {
			var _this = this;
			$window = $($.templates(settings.template_selector).render({
				'window_id': window_id,
				'content': settings.content,
				'border_type': settings.border_type,
				'show_buttons': settings.show_buttons
			}));
			$('body').append($window);
			$window.find('.window-dismiss').click(function() {
				_this.remove();
			});
		}
		
		switch(settings.animation_type) {
			case 'dialog':
				$window.fadeIn(300);
				$window.find('.jq-yes').on('click', function() {
					settings.yes.call(_this);
					_this.remove();
				});
				$window.find('.jq-no').on('click', function() {
					settings.no.call(_this);
					_this.remove();
				});
				break;
			default:
				$window.slideDown(300);
		}
		
	};
	
	this.remove = function() {		
		var removeElement = function() { $window.remove() };
		
		switch(settings.animation_type) {
			case 'dialog':
				$window.fadeOut(removeElement);
				dfb.ui.hideDialogOverlay();
				break;
			default:
				$window.slideUp(removeElement);
		}				
	};
	
};

dfb.ui.Window.showYesNoDialog = function(options) {
	var settings = $.extend({}, {
		animation_type: 'dialog',	
		template_selector: '#ui-window',		
		border_type: 'warning centered',
		show_buttons: true
	}, options);
	
	var window = new dfb.ui.Window(settings);
	window.show();
	dfb.ui.showDialogOverlay();
};

/** jquery plugins **/
/** editable text plugin **/
(function($, document, window, undefined) {	
	"use strict";

	var tinymce_cnt = 1;
	var defaults = {	
		on_complete: function() {},		
		custom_text_class: '',
		textarea_mode: false,
	};
	var lastvalue = null; /* last text before the user started editing */
	var editing = false;
	
	function editabletext(element, options) {
		this.$element = $(element);
			
		this.options = $.extend({}, defaults, options);
		this.on_complete = this.options.on_complete;				
				
		this.init();		
	}
	
	editabletext.prototype.init = function() { 
		var _this = this;		
		this.$element	
			.addClass('editable-text')
			.bind('click', function(evt) {
				if(_this.editing) return;
				
				_this.$element.data('lasthtml', _this.$element.html());
				_this.showEditableArea();				
				evt.stopImmediatePropagation();
				_this.editing = true;
			})
			.bind('mouseover', function(evt) {
				_this.$element.addClass('editable-text-hover');
				/* hide other save/cancel controls */
				$('.editable-text-controls').hide();
				_this.$element.find('.editable-text-controls').show();
			})
			.bind('mouseout', function(evt) {
				_this.$element.removeClass('editable-text-hover');
			});
	};
	
	editabletext.prototype.showEditableArea = function() {
		var _this = this;
				
		var $html = null;
		if(this.options.textarea_mode) {
			this.lastvalue = this.$element.html();
			$html = $(this.$element.html("<textarea class='editable-textbox jq-edit-text'>" + this.options.custom_text_class + "</textarea>"));			
		}else{
			this.lastvalue = this.$element.text();
			$html = $(this.$element.html("<input type='text' class='editable-textbox jq-edit-text " + this.options.custom_text_class + "' />"));
		}
				
		$html.find('.jq-edit-text')
			.val($.trim(this.lastvalue))
			.focus()
			.bind('keydown', function(evt) {
				if(evt.which == 13 /* enter key */) {
					evt.preventDefault();	
					_this.confirmEdit();
				}else if(evt.which == 27) /* escape key */ {
					evt.preventDefault();
					evt.stopPropagation();
					_this.cancelEdit();
				}
			});
		
		var $editor_controls = $("<div class='editable-text-controls'><div class='save'>save</div><div class='cancel'>cancel</div></div>");
		$editor_controls.find('.save')
			.click(function(evt) {
				_this.confirmEdit();
				_this.$element.removeClass('editable-text-hover');
				evt.stopPropagation();
			});
		$editor_controls.find('.cancel')
			.click(function(evt) {
				_this.cancelEdit();
				_this.$element.removeClass('editable-text-hover');
				evt.stopPropagation();
			});
		//$editor_controls.css({'left': this.$element.css('width')});
		
		this.$element.prepend($editor_controls);
		
		if(this.options.textarea_mode) {
			var tinymce_id = 'tinymce' + (tinymce_cnt++);
			
			$html.find('.jq-edit-text')
				.attr('id', tinymce_id)
				.addClass(tinymce_id);
			tinyMCE.init({
				mode: 'specific_textareas',				
				editor_selector: tinymce_id,
			});
						
		}
	};
	
	editabletext.prototype.confirmEdit = function() {
		if(this.options.textarea_mode) {
			tinyMCE.triggerSave();	
			this.$element.html(this.$element.find('.jq-edit-text').val());
		}else{
			this.$element.text(this.$element.find('.jq-edit-text').val()); 
		}
		this.editing = false;
		this.lastvalue = null;
	};
	
	editabletext.prototype.cancelEdit = function() {
		if(this.options.textarea_mode) {
			this.$element.html(this.lastvalue);
		}else{
			this.$element.text(this.lastvalue); 
		}
		this.editing = false;
		this.lastvalue = null		
	};
	
	$.fn.editabletext = function(options) {		
		var pluginName = 'editabletext';
		// Iterate through each DOM element and return it
		return this.each(function() {
			// prevent multiple instantiations
			if (!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new editabletext( this, options ));
			}

		});
	}; 
	
})(jQuery, document, window); // end closure wrapper

/** context menu option group plugin **/
(function($, document, window, undefined) {	
	"use strict";
	
	var defaults = {	
		on_remove: function() {},
		on_add: function() {},
		on_index_change: function() {},
		on_text_change: function() {},
		row_template_selector: '#context-menu-option-group-row',
		radio_group_name: 'ctx-dropdown-options',
		allow_selection: true,
		allow_multiple: false,
		options: {}
	};
		
	function contextmenuoptions(element, options) {
		this.$element = $(element);
			
		this.options = $.extend({}, defaults, options);
		this.on_remove = this.options.on_remove;
		this.on_add = this.options.on_add;
		this.on_index_change = this.options.on_index_change;		
		this.on_text_change = this.options.on_text_change;
		
		this.init();		
	}
	
	contextmenuoptions.prototype.init = function() { 
		var $_this = $(this);
		var _this = this;
		
		this.$element.find('.option-wrapper').each(function() {
			_this.wireUpOptionGroup($(this));
		})		
		var $addButton = this.$element.find('.jq-add');
		$addButton.on('click', function() {
			var $html = $($.templates(_this.options.row_template_selector).render({}, {
				index: _this.$element.find('.option-wrapper').length, 
				allowSelection: _this.options.allow_selection,
				allowMultiple: _this.options.allow_multiple,
				groupName: _this.options.radio_group_name,
			}));
			_this.wireUpOptionGroup($html);
			$html.hide().insertAfter(_this.$element.find('.option-wrapper:last')).fadeIn('fast');
			_this.on_add();
		});
	};
	
	contextmenuoptions.prototype.wireUpOptionGroup = function($option_group) {
		var $radButton = $option_group.find('input[type=radio]');
		var $chkBox = $option_group.find('input[type=checkbox]');
		var $textInput = $option_group.find('input[type=text]');
		var $deleteButton = $option_group.find('.jq-remove');
		
		var _this = this;
		
		$radButton.on('change', function() {				
			var selectedIndex = $(this).val();			
			_this.on_index_change(selectedIndex, $(this).is(':checked'));			
		});
		$chkBox.on('change', function() {
			var selectedIndex = $(this).val();			
			_this.on_index_change(selectedIndex, $(this).is(':checked'));	
		});
		$textInput.on('keyup', function() {
			var selectedIndex = $deleteButton.data().index;
			_this.on_text_change(selectedIndex, $(this).val());							
		});
		$deleteButton.on('click', function() {
			if(_this.$element.find('.option-wrapper').length > 1) {			
				$option_group.fadeOut('fast', function() {
					var selectedIndex = $deleteButton.data().index;
					$option_group.remove();
					_this.on_remove(selectedIndex);				
					_this.resetIndexes();				
				});
			}
		});		
	};
	
	contextmenuoptions.prototype.getOptions = function() {
		var options = [];
		this.$element.find('.option-wrapper').each(function() {
			options.push({
				text : $(this).find('input[type=text]').val(),
				selected : $(this).find('input[type=radio]').is(':checked') || $(this).find('input[type=checkbox]').is(':checked')
			});
		});
		
		return options;
	};
	
	contextmenuoptions.prototype.resetIndexes = function() {
		var cnt = 0;
		this.$element.find('.option-wrapper').each(function() {			
			$(this).find('input[type=radio]').val(cnt);
			$(this).find('input[type=checkbox]').val(cnt);
			$(this).find('.jq-remove').data('index', cnt);
			cnt++;
		});
	};
	
	$.fn.contextmenuoptions = function(options) {		
		var pluginName = 'contextmenuoptions';
		// Iterate through each DOM element and return it
		
		return this.each(function() {
			// prevent multiple instantiations
			if (!$.data(this, 'plugin_' + pluginName)) {				
				$.data(this, 'plugin_' + pluginName, new contextmenuoptions( this, options ));
			}

		});
	}; 
	
})(jQuery, document, window); // end closure wrapper

/** utility functions **/
window.getFunctionFromString = function(string) {
    var scope = window;
    var scopeSplit = string.split('.');
    for (i = 0; i < scopeSplit.length - 1; i++) {
        scope = scope[scopeSplit[i]];

        if (scope == undefined) return;
    }

    return scope[scopeSplit[scopeSplit.length - 1]];
}

window.htmlEncode = function(value){
	//create a in-memory div, set it's inner text(which jQuery automatically encodes)
	//then grab the encoded contents back out.  The div never exists on the page.
	return $('<div/>').text(value).html();
}

window.htmlDecode = function(value){
	return $('<div/>').html(value).text();
}