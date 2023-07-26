#!/bin/bash
cd ../..

if [ "$1" == "server" ]
then
    hugo server --buildDrafts;
elif [ "$1" == "new" ]
then
    if [ "$2" != "site" ]
    then
        create_info=`hugo new "content/post/$2"`;
        echo $create_info;
        created=`echo $create_info | grep "content/post/$2\" created"`;
        if [[ "$created" != "" ]]
        then
            code "content/post/$2";
        fi
    fi
elif [ -z "$1" ]
then
    hugo
fi
