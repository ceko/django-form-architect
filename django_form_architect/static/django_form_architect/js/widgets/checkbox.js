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