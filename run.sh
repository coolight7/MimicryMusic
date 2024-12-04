#!/bin/bash
script_dir=$(pwd)

cd $script_dir/docx/
sudo ./build_docx.sh

cd $script_dir
chmod -R 0755 ./*