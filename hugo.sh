#!/bin/bash

### 配置信息-START ###
WORK_DIR="/root/myblog" # 工作目录
CONTENT_DIR="content"   # 内容目录（工作目录的相对路径）
BLOG_DIR="blog"         # 博客目录（内容目录的相对路径）
DOCS_DIR="docs"         # 文档目录（内容目录的相对路径）
BLOG_FULL_DIR="$CONTENT_DIR/$BLOG_DIR"  # 博客目录（相对工作目录的完整路径）
DOCS_FULL_DIR="$CONTENT_DIR/$DOCS_DIR"  # 文档目录（相对工作目录的完整路径）
### 配置信息-END ###


hugo_new() {
    created_file="$1"
    create_info=`hugo new "$created_file"`;
    echo $create_info;
    created=`echo $create_info | grep "$created_file\" created"`;
    if [[ "$created" != "" ]]
    then
        code "$created_file";
    fi
}

cd $WORK_DIR

if [ "$1" == "server" ]
then
    echo "##############################"
    echo "博客预览（包括草稿文档）"
    echo "##############################"
    hugo server -D;
    echo "##############################"
    echo "已退出预览"
    echo "##############################"
elif [ "$1" == "new" ]
then
    if [ "$2" == "blog" ]
    then
        hugo_new "$BLOG_FULL_DIR/$3"
    elif [ "$2" == "doc" ]
    then
        hugo_new "$DOCS_FULL_DIR/$3"
    else
        hugo_new "$CONTENT_DIR/$2"
    fi
elif [ -z "$1" ]
then
    hugo
else
    echo "##############################"
    echo "当前工作目录为\"$WORK_DIR\"，请注意路径是否正确"
    echo "##############################"
    hugo $@
fi
