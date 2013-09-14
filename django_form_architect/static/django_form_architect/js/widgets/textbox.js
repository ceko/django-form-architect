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