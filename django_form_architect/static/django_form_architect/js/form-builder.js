var dfb = dfb || {};

dfb.FormSettings = function(options) {
	
	this.settings = $.extend({}, {
		name: null,		
	}, options);
	console.log(options);
	this.render = function(template_selector) {
		this.$html = $($.templates(template_selector).render(getTemplateData.call(this)));
		this.$html.find('#form-name').val(this.settings.name);
		return this.$html;		
	}
	
	var getTemplateData = function() {
		return {};
	}
	
}

/* context menu that shows up when a form item has been selected */
dfb.ContextMenu = function() {
	
	this.active_object = null;
	this.$slide = null;
	
	this.render = function(template_selector) {
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
		dfb_globals.left_menu_accordian.showByTag('context-menu', this.positionMenuAtActive.bind(this))		
		return this;
	}
	
	this.hideCurrentMenu = function() {
		this.$slide.hide();
		if(this.active_object) {
			this.active_object.$html.closest('.widget-wrap').removeClass('active');
		}
		this.active_object = null;		
	}
	
	this.hideIfActive = function(widget) {
		if(this.active_object === widget) {
			this.$slide.fadeOut('fast');
			widget.$html.closest('.widget-wrap').removeClass('active');
			this.active_object = null;
		}
	}
	
	this.positionMenuAtActive = function(suppress_animation) {
		if(this.active_object) {
			var $ctx_menu_header = $('#context-menu-header');
			var $widget_wrap = this.active_object.getElement().closest('.widget-wrap');
			var widget_wrap_top = $widget_wrap.position().top;			
			
			if(widget_wrap_top === 0 || !$widget_wrap.is(':visible')) {
				widget_wrap_top = $('#form-builder-fields .ui-form-element-placeholder').position().top;				
			}
			this.positionMenuAt(widget_wrap_top-$ctx_menu_header.offset().top-3 + $ctx_menu_header.height(), suppress_animation);
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

dfb.WidgetTypes = {
	
	widget_types: {},
	add: function(key, type) {
		this.widget_types[key] = type;
	},	
	getAll: function() {		
		return this.widget_types;
	},
	get: function(key) {
		return this.widget_types[key];
	}			
}

dfb.WidgetType = function(options) {
	
	var getAutoTemplate = function(klass) {		
		if(klass) {			
			return '#' + klass.toLowerCase().replace(/\./g, '-');
		}else{
			return null;
		}
	};
	
	this.settings = $.extend({}, {		
		name: 'undefined',
		klass: null,
		template: getAutoTemplate(options.klass)
	}, options);
	
}

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
		this.$html
			.find('#form-builder-fields')			
			.droppable({
				accept: ":not(.ui-sortable-helper)", /* so sorting doesn't trigger this */				
			})			
			.sortable({
				helper: 'clone',
				axis: 'y',
				distance: 20,
				connectWith: '.form-element',
				placeholder: 'ui-form-element-placeholder',
				stop: function(evt, ui) {					
					if(!ui.item.data().initialized) {
						ui.item.attr('id', null);
						ui.item.attr('class', 'widget-wrap pageable');
						loadDroppedWidget.call(_this, ui.item);						
					}					
					
					setTimeout(function() { dfb_globals.context_menu.positionMenuAtActive(true) }, 100);
					var widget = ui.item.find('.widget').data('widget');
					if(!dfb_globals.builder.getCurrentPage().hasWidget(widget)) {
						widget.hide();
					}
				},
				start: function(evt, ui){
			        ui.placeholder.height(ui.helper.outerHeight());
			    },
			    change: function(evt, ui) {
					dfb_globals.context_menu.positionMenuAtActive(true);					
				},				
			})			
			.disableSelection();
		this.$html.find('#pagination-tabs div.jq-add-page').on('click', function() {			
			var page = dfb_globals.builder.addPage({
				pid: null,
				name: 'new page',
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
		var errors = [];
		var _this = this;				
		var form = {
			'pid': $('#form-pid').val(),
			'title': $.trim($('#form-title').text()),
			'description': $.trim($('#form-description').html()),
			'name': $.trim($('#form-name').val()),
		};
		
		/** @TODO: Basic validation **/
		if(form.name == '') {
			errors.push('set a form name under "change form settings"');
		}
		
		var pages = [];		
		var page_sequence = 0;
		var has_widgets = false;
		$('#pagination-tabs .page').each(function() {
			var page = $(this).data().page;
			var widgets = [];
			page.syncWidgetSequence();			
			
			var widget_sequence = 0;
			for(i=0;i<page.widgets.length;i++) {
				var configurables = page.widgets[i].exportConfigurables();
				configurables['sequence'] = widget_sequence++;
				widgets.push(configurables);
				has_widgets = true;
			}
			pages.push({
				pid: page.getPid(),
				sequence: page_sequence++,
				name: page.getPageName(),
				widgets: widgets
			});
		});
		if(!has_widgets) {
			errors.push('add at least one field');
		}
		
		if(errors.length > 0) {
			var error_html = '';
			for(i=0;i<errors.length;i++) {
				error_html += "<div class='validation-error'>" + errors[i] + "</div>";
			}
			
			var window = new dfb.ui.Window({
				content: '<div class="validation-header">Please correct the following</div>' + error_html,
				border_type: 'failure',
			});
			window.show();
			setTimeout(function(){window.remove()}, 5000);
			
			return;
		}
		
		dfb.ui.showWaiter();
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
	
	this.hasWidget = function(widget) {
		return this.widgets.indexOf(widget) > -1;
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
		return $([$('<div class="clickjack"></div>')[0], this.$controls[0], this.$html[0]]);
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
		var setDefault = function() {
			$defaultable.val($(this).val());
		};
		$context_menu.find('.jq-default')
			.keyup(setDefault)
			.blur(function() { setTimeout(setDefault.bind(this), 100)})
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
		
		var $editor_controls = $("<div class='editable-text-controls'><div class='arrow'></div><div class='save'>save</div><div class='cancel'>cancel</div></div>");
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

/** global template helpers **/
$.views.helpers({
	getWidgetTypes: function() {
		//jsrender can't iterate object properties;
		widgets = [];
		all_widgets = dfb.WidgetTypes.getAll();
		for(prop in all_widgets) {
			if(all_widgets.hasOwnProperty(prop)) {
				widgets.push(all_widgets[prop]);
			}
		}
	
		return widgets;
	}
});