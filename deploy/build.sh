#!/bin/bash

dir=$(cd $(dirname $0); pwd)
cd ${dir}

rm -r ../dist
mkdir ../dist

pwd
if [ $1 = 'stg' ]; then
	LAMBDA_FUNCTION_NAME=flow-bg-stg
	echo 'Zip for STG'
	exit
elif [ $1 = 'prd' ]; then
	LAMBDA_FUNCTION_NAME=flow-bg-prd
	echo 'Zip for PRD'
	exit
elif [ $1 = 'flow' ]; then
	LAMBDA_FUNCTION_NAME=flow-bg
	cp custom_settings/bg_flow.env ../dist/.env
	filename="flow_upload.zip"
	rm ${dir}/../${filename}
	echo 'Zip for FLOW'
elif [ $1 = 'local' ]; then
	LAMBDA_FUNCTION_NAME=local-bg-test
	cp custom_settings/bg_local.env ../dist/.env
elif [ $1 = 'test' ]; then
	LAMBDA_FUNCTION_NAME=local-bg-test
	cp custom_settings/bg_local.env ../dist/.env
elif [ $1 = 'build' ]; then
	LAMBDA_FUNCTION_NAME=local-bg-test
	cp custom_settings/bg_local.env ../dist/.env
else
	exit
fi

cp custom_settings/customSettings.cnf ../src/common/customSettings.ts

git show --format='VERSION=%h' --no-patch >> ../dist/.env
date +'DEPLOY_DATETIME=%Y/%m/%d_%H:%M:%S' >> ../dist/.env

echo "DIR:" $dir
echo "MODE:" $1
echo "NAME:" $LAMBDA_FUNCTION_NAME

cd ../src
tsc
cp ../package.json ../dist
cp ../package-lock.json ../dist
cp -r ../node_modules ../dist

cd ../dist
if [ $1 = 'local' ]; then
	echo "start express run";
	NODE_ENV=develop node index.js
elif [ $1 = 'test' ]; then
	echo "start test run";
	NODE_ENV=develop node testauto.js
elif [ $1 = 'build' ]; then
	echo "start test run";
	echo "cd ${dir}/../dist;"
	ls test/unit
	echo "NODE_ENV=develop node test.js [target]"
else
	zip -rq ${dir}/../${filename} ./*
	zip ${dir}/../${filename} .env

	zip --delete ${dir}/../${filename} test.js
	zip --delete ${dir}/../${filename} testauto.js
	zip --delete ${dir}/../${filename} test/*

	cd ${dir}/../
	aws lambda update-function-code --function-name ${LAMBDA_FUNCTION_NAME} --zip-file fileb://${filename}
fi
