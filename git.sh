#!/bin/bash

### 配置信息-START ###
WORK_DIR="/root/myblog" # 工作目录
PUBLIC_DIR="public"     # 生成的网站页面的目录（工作目录的相对路径）
### 配置信息-END ###

add_all(){
    git add --all
}

commit(){
    add_all
    git commit -m "$1"
}

push(){
    commit $1
    echo "--------------------------------"
    git push
}

cd_public(){
    cd "$PUBLIC_DIR"
}

# 命令参数解析
param(){
    if [ "$1" == "add" ]
    then
        add
    elif [ "$1" == "commit" ]
    then
        commit $2
    elif [ "$1" == "push" ]
    then
        push $2
    else
        echo "请正确指定参数"
    fi
}

cd $WORK_DIR

if [ "$1" == "public" ]
then
    cd_public
    param $2 $3
elif [ "$1" == "all" ]
then
    echo "[$WORK_DIR]："
    param $2 $3
    echo "----------------------------------------------------------------"
    hugo
    echo "----------------------------------------------------------------"
    echo "[$WORK_DIR/$PUBLIC_DIR]："
    cd_public
    param $2 $3
elif [[ "$1" == "add" || "$1" == "commit" || "$1" == "push" ]]
then
    param $1 $2
else
    echo "请正确使用命令"
fi
