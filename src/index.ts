import { PicGo } from 'picgo'
import axios from 'axios'
import fs from 'fs'
import crypto from 'crypto'

export = (ctx: PicGo) => {
  const config = ctx => {
    let userConfig = ctx.getConfig('picBed.azureimg')
    if (!userConfig) {
      userConfig = {}
    }
    return [
      {
        name: 'token',
        type: 'input',
        default: userConfig.token,
        required: true,
        message: '认证 token 信息',
        alias: 'Auth token'
      },
      {
        name: 'projectId',
        type: 'input',
        default: userConfig.projectId,
        required: true,
        message: 'Project 的 ID',
        alias: 'Project ID'
      },
      {
        name: 'repoId',
        type: 'input',
        default: userConfig.repoId,
        required: true,
        message: 'Repo 的 ID',
        alias: 'Repo ID'
      },
      {
        name: 'orgDomain',
        type: 'input',
        default: userConfig.orgDomain,
        required: true,
        message: '组织的地址（一般是 dev.azure.com/[组织名]，或者是自己自定义的 [组织名].visualstudio.com）',
        alias: 'Org Domain'
      },
      {
        name: 'orgName',
        type: 'input',
        default: userConfig.orgName,
        required: true,
        message: '组织的名',
        alias: 'Org Name'
      }
    ]
  }
  const handle = async (ctx: PicGo) => {
    //配置信息
    const userConfig: any = ctx.getConfig('picBed.azureimg')
    if (!userConfig) {
      throw new Error('Can\'t find uploader config')
    }
    const token = userConfig.token;
    const projectId = userConfig.projectId;
    const repoId = userConfig.repoId;
    const orgDomain = userConfig.orgDomain;
    const orgName = userConfig.orgName;

    const token_base64 = Buffer.from(":" + token).toString('base64');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + token_base64
    };
    const today = new Date();
    const dir_name = `${today.getFullYear()}/${today.getMonth()}/${today.getDay()}`;
    const https = require('node:https');
    var commit_config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://dev.azure.com/${orgName}/${projectId}/_apis/git/repositories/${repoId}/commits`,
      headers: headers,
      httpsAgent: new https.Agent({ keepAlive: true })
    };
    let input = ctx.input;
    let output = ctx.output;
    let git_changes = [];
    //git changes
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        const file_path = input[key];
        const file_buffer = fs.readFileSync(file_path);
        const contents_in_base64 = file_buffer.toString('base64');
        const file_name = crypto.randomBytes(6).toString('hex');
        let change = {
          "changeType": "add",
          "item": {
            "path": `/${dir_name}/${file_name}` + output[key].extname
          },
          "newContent": {
            "content": contents_in_base64,
            "contentType": "base64encoded"
          }
        };
        output[key].fileName = file_name + output[key].extname;
        git_changes.push(change);
      }
    }
    let commit_response = await axios(commit_config);
    let commit_count = commit_response.data['count'];
    let commit_id = null;
    if (commit_count != 0) {
      commit_id = commit_response.data['value'][0]['commitId'];
    }
    var data = JSON.stringify({
      "refUpdates": [
        {
          "name": "refs/heads/master",
          "oldObjectId": commit_id
        }
      ],
      "commits": [
        {
          "comment": "upload file(s).",
          "changes": git_changes
        }
      ]
    });
    let upload_data_config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `https://dev.azure.com/${orgName}/setu/_apis/git/repositories/${repoId}/pushes?api-version=7.0`,
      headers: headers,
      data: data,
      httpsAgent: new https.Agent({ keepAlive: true })
    };
    let upload_data_response = await axios(upload_data_config);
    for (let i in output) {
      output[i].imgUrl = `https://${orgDomain}/${projectId}/_apis/git/repositories/${repoId}/items?path=/${dir_name}/${output[i].fileName}&$format=octetStream&api-version=5.0`;
      output[i].url = `https://${orgDomain}/${projectId}/_apis/git/repositories/${repoId}/items?path=/${dir_name}/${output[i].fileName}&$format=octetStream&api-version=5.0`;
    }
    //return ctx;
    //console.log(ctx)
  }
  const register = () => {
    ctx.helper.uploader.register('azureimg', { handle, config: config })
  }
  return {
    uploader: 'azureimg',
    config: config,
    register
  }
}