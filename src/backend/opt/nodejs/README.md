# Utilities

Note that this folder is for shared functions availible to all Lambda functions in AWS. It is saved under `opt/nodejs` because that is what the import function will look like when added to a layer in AWS.

## How to use the shared Lambda functions

Go to the Lambda function that you wish to add the shared code to, and scroll all the way down to the bottom. There should be a `Layers` section. Click `Add a layer`. Then, click `Custom Layers` and choose `utils` in the dropdown. Then, choose the latest version.

## How to update the shared Lambda functions

To update the Lambda function, zip up the entire [nodejs](/src/backend/opt/nodejs/) folder (not the contents, the folder). Then, go to AWS and click `Lambda`, and click `Layers` on the left navbar. It should be under `Additional Resources`. Click on `utils` and then `Create version`. Add an option message as to why you are updating the layer, and upload the zipped nodejs folder. Click `x86_64`, and choose `Node.js 20.x` under compatible runtimes. You can leave the License section blank. Click `Create`.

Then, scroll down and click the **second newest** version. Then, scroll down and click `Functions using this version`. Select all of them, click `Edit`, and make the dropdown the latest version. Finally, click `Update functions`.
