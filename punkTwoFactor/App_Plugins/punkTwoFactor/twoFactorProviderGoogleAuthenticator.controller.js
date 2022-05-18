!(function () {
    "use strict";

    const googleTwoFactorProviderCtrl = [
        '$scope', 'twoFactorLoginResource', 'notificationsService',
        function ($scope, twoFactorLoginResource, notificationsService) {
            const vm = this;

            vm.title = "Setup Google Authenticator on " + $scope.model?.user?.name;
            vm.providerName = $scope.model?.providerName;
            vm.qrCodeImageUrl = "";
            vm.secret = "";
            vm.code = "";
            vm.authForm = {};
            vm.buttonState = "init";

            vm.close = close;
            vm.validateAndSave = validateAndSave;

            function init() {
                vm.buttonState = "init";
                twoFactorLoginResource.setupInfo(vm.providerName)
                    .then(function (response) {
                        // This response is the model I defined to be returned from ITwoFactorProvider.GetSetupDataAsync
                        vm.qrCodeImageUrl = response.qrCodeSetupImageUrl;
                        vm.secret = response.secret;
                    })
                    .catch(function () {
                        notificationsService.error("Could not fetch login info");
                    });
            }

            function validateAndSave() {
                vm.authForm.token.$setValidity("token", true);
                vm.buttonState = "busy";

                twoFactorLoginResource.validateAndSave(vm.providerName, vm.secret, vm.code)
                    .then(function (successful) {

                        if (successful) {
                            notificationsService.success("Two-factor authentication has successfully been enabled");
                            vm.buttonState = "success";
                            close();
                        } else {
                            vm.authForm.token.$setValidity("token", false);
                            vm.buttonState = "error";
                        }

                    })
                    .catch(function (error) {
                        notificationsService.error(error);
                        vm.buttonState = "error";
                    });
            }

            function close() {
                if ($scope.model.close) {
                    $scope.model.close();
                }
            }

            init();
        }
    ];

    angular.module("umbraco").controller("CustomCode.TwoFactorProviderGoogleAuthenticator", googleTwoFactorProviderCtrl);
})();