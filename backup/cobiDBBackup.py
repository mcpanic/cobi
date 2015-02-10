#! /usr/bin/env python2

import os
import sys
import time

database = "--host mysql.csail.mit.edu --user=cobi --password=su4Biha cobiCHI2015Dev";
location = "cobi";
location += "-";
location += time.strftime("%Y-%m-%d-%H-%M-%S");

command = "/Applications/MAMP/Library/bin/mysqldump "+database+" > "+location+".sql"
print command
os.system(command)
