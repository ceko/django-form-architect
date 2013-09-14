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