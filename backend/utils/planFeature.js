 const extractContactLimit = (featureName) => {
  const regex = /view up to (\d+) contact numbers/i;
  const match = featureName.match(regex);

  if (match) {
    return parseInt(match[1], 10);
  }

  return null;
};

/* =====================================================
   Feature Key Mapping
===================================================== */

 const featureKeyMap = {
  "Featured Profile Badge": "featuredProfileBadge",
  "Premium Profile Badge": "premiumProfileBadge",
  "Top Visibility in Search": "topVisibilityInSearch",
  "Get More Leads": "getMoreLeads",
  "Video Call Access": "videoCallAccess",
  "Secure Payment System": "securePaymentSystem",
  "Profile Time Slots": "profileTimeSlots",
  "Upload More images in Profile Gallery": "uploadMoreImages",
  "Add Service & Business Catalogue": "serviceCatalogue",
  "Link social media profiles": "socialMediaLinks",
  "Add your business website link": "websiteLink",
  "Send Unlimited Messages": "unlimitedMessages",
};

module.exports = {extractContactLimit, featureKeyMap};
