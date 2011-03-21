Doc Builder
-----------
In this directory I've placed the necessary 
for building the documentation from the source library.

What you need
--------------
 * Java JDK 1.5 or higher (I suppose JRE should work too)
 * ANT

How to use it
-------------
If you know what is ANT then use the ant-build.xml.

If you don't know nothing about ANT and you're using a *NIX os, then
open a shell and from this directory:
<code>
$ chmod +x ant-runner.sh
$ ./ant-runner.sh
</code>

If don't know nothing about ANT and you're using Windows, 
then open the command line (window+r, cmd.exe) and dir to this
folder. Here you have to type:
<code>
ant -f ant-build.xml
</code>
