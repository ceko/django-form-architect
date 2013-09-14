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