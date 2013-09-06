# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Widget.is_active'
        db.add_column('django_form_architect_widget', 'is_active',
                      self.gf('django.db.models.fields.BooleanField')(default=True),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Widget.is_active'
        db.delete_column('django_form_architect_widget', 'is_active')


    models = {
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'django_form_architect.checkboxwidget': {
            'Meta': {'ordering': "('sequence',)", 'object_name': 'CheckBoxWidget', '_ormbases': ['django_form_architect.Widget']},
            'widget_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['django_form_architect.Widget']", 'unique': 'True', 'primary_key': 'True'})
        },
        'django_form_architect.dropdownwidget': {
            'Meta': {'ordering': "('sequence',)", 'object_name': 'DropDownWidget', '_ormbases': ['django_form_architect.Widget']},
            'size': ('django.db.models.fields.CharField', [], {'default': "'m'", 'max_length': '1'}),
            'widget_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['django_form_architect.Widget']", 'unique': 'True', 'primary_key': 'True'})
        },
        'django_form_architect.form': {
            'Meta': {'object_name': 'Form'},
            'description': ('django.db.models.fields.TextField', [], {}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'pid': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '50'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        'django_form_architect.page': {
            'Meta': {'ordering': "('sequence',)", 'object_name': 'Page'},
            'form': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['django_form_architect.Form']"}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'pid': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'sequence': ('django.db.models.fields.IntegerField', [], {'default': '0'})
        },
        'django_form_architect.radiobuttonwidget': {
            'Meta': {'ordering': "('sequence',)", 'object_name': 'RadioButtonWidget', '_ormbases': ['django_form_architect.Widget']},
            'widget_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['django_form_architect.Widget']", 'unique': 'True', 'primary_key': 'True'})
        },
        'django_form_architect.sectionbreakwidget': {
            'Meta': {'ordering': "('sequence',)", 'object_name': 'SectionBreakWidget', '_ormbases': ['django_form_architect.Widget']},
            'widget_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['django_form_architect.Widget']", 'unique': 'True', 'primary_key': 'True'})
        },
        'django_form_architect.selectiontablewidget': {
            'Meta': {'ordering': "('sequence',)", 'object_name': 'SelectionTableWidget', '_ormbases': ['django_form_architect.Widget']},
            'widget_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['django_form_architect.Widget']", 'unique': 'True', 'primary_key': 'True'})
        },
        'django_form_architect.textareawidget': {
            'Meta': {'ordering': "('sequence',)", 'object_name': 'TextAreaWidget', '_ormbases': ['django_form_architect.Widget']},
            'content_type': ('django.db.models.fields.CharField', [], {'max_length': '10'}),
            'default': ('django.db.models.fields.TextField', [], {'null': 'True'}),
            'size': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'widget_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['django_form_architect.Widget']", 'unique': 'True', 'primary_key': 'True'})
        },
        'django_form_architect.textboxwidget': {
            'Meta': {'ordering': "('sequence',)", 'object_name': 'TextBoxWidget', '_ormbases': ['django_form_architect.Widget']},
            'default': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True'}),
            'size': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'widget_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['django_form_architect.Widget']", 'unique': 'True', 'primary_key': 'True'})
        },
        'django_form_architect.widget': {
            'Meta': {'ordering': "('sequence',)", 'object_name': 'Widget'},
            'form': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['django_form_architect.Form']"}),
            'help_text': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True'}),
            'page': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['django_form_architect.Page']"}),
            'pid': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'polymorphic_ctype': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'polymorphic_django_form_architect.widget_set'", 'null': 'True', 'to': "orm['contenttypes.ContentType']"}),
            'required': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'sequence': ('django.db.models.fields.IntegerField', [], {'default': '0'})
        },
        'django_form_architect.widgetoption': {
            'Meta': {'ordering': "('sequence',)", 'object_name': 'WidgetOption'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'selected': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'selection_group': ('django.db.models.fields.CharField', [], {'default': "'options'", 'max_length': '10'}),
            'sequence': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'text': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'widget': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['django_form_architect.Widget']"})
        }
    }

    complete_apps = ['django_form_architect']