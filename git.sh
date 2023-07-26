#!/bin/bash
function public_git(){
    cd ../..
    echo "-------------MYBLOG-------------"
    ./git.sh $1 $2
    cd content/post
}

function add(){
    echo "自动缓存"
    git add --all
}

function commit(){
    echo "自动缓存并提交"
    echo "--------------------------------"
    add
    echo "--------------------------------"
    echo "提交所有缓存"
    git commit -m "$1"
}

function push(){
    echo "自动缓存提交并同步更改"
    echo "--------------------------------"
    commit $1
    echo "--------------------------------"
    echo "同步更改"
    git push
}

function param(){
    echo "--------------POST--------------"

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

if [ "$1" == "blog" ]
then
    public_git $2 $3
elif [ "$1" == "all" ]
then
    param $2 $3
    public_git $2 $3
elif [[ "$1" == "add" || "$1" == "commit" || "$1" == "push" ]]
then
    param $1 $2
else
    echo "请正确使用命令"
fi
