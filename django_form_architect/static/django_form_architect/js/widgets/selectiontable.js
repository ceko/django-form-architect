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