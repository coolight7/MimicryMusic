#!/bin/bash
script_dir=$(dirname "$0")

cd $script_dir/docx/
./build_docx.sh

cd $script_dir
chmod -R 0755 ./*