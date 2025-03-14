import apiClient from "../configs/axiosConfig";

const fetchTherapistList = async () => {
  try {
    const response = await apiClient.get("/coupletherapist");
    return response.data.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const fetchSearchTherapistList = async (searchQuery) => {
  try {
    const therapistList = await fetchTherapistList();
    if (!searchQuery.trim()) {
      return therapistList;
    }
    const filteredList = therapistList.filter(
      (therapist) =>
        therapist.userInfo?.fullname
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        therapist.specialty
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        therapist.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filteredList;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const fetchTherapistDetail = async (therapistId) => {
  try {
    const response = await apiClient.get(`/coupletherapist/${therapistId}`);
    return response.data.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const fetchAvailabilityList = async (therapistId) => {
  try {
    const response = await apiClient.get(
      `/coupletherapist/get-availability/${therapistId}`
    );
    return response.data.data;
  } catch (error) {
    console.log(
      `Error while fetching availability for couple therapist ${therapistId}`,
      error
    );
    return [];
  }
};

export {
  fetchTherapistList,
  fetchSearchTherapistList,
  fetchTherapistDetail,
  fetchAvailabilityList,
};
