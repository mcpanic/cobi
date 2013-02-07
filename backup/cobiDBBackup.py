#! /usr/bin/env python2

import os
import sys
import time

database = "--host mysql.csail.mit.edu --user=cobi --password=su4Biha cobi";
location = "cobi";
location += "-";
location += time.strftime("%Y-%m-%d-%H-%M-%S");

command = "mysqldump "+database+" > "+location+".sql"
print command
os.system(command)
