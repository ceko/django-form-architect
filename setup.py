from setuptools import setup, find_packages
import sys, os

version = '0.1'

setup(name='django_form_architect',
      version=version,
      description="An easy way to create re-usable customizable forms.",
      long_description="""\
This package is meant to be a full-featured form builder for non-technical and technical users alike.  The forms will then be usable as HTML embeds in other applications or as a quick way to generate a boilerplate form without creating a template and form 
object.""",
      classifiers=[], # Get strings from http://pypi.python.org/pypi?%3Aaction=list_classifiers
      keywords='',
      author='Dave Lafferty',
      author_email='web_tech@naz.edu',
      url='http://www.naz.edu/',
      license='MIT',
      packages=find_packages(exclude=['ez_setup', 'examples', 'tests']),
      include_package_data=True,
      zip_safe=False,
      install_requires=[
          # -*- Extra requirements: -*-
          'django-polymorphic',
          'django >= 1.5.1'
      ],
      entry_points="""
      # -*- Entry points: -*-
      """,
      )
