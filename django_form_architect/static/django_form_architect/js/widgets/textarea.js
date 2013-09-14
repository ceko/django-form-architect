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