import React from 'react';
import SettingsProvider from '../Context/SettingsContext';
import ProfileProvider from '../Context/ProfileContext';
import EditUserProvider from '../Context/EditUserContext';
import SuggestionsProvider from '../Context/SuggestionsContext';
import FetchAllGroupsProvider from '../Context/fetchAllGroupsContext';
import DeleteGroupProvider from '../Context/DeleteGroupContext';
import ChatContextProvider from '../Context/ChatContext';
import GroupProfileProvider from '../Context/groupProfileContext';
import PostContextProvider from '../Context/PostContext';
import CommentContextProvider from '../Context/CommentContext';

const Provider = ({ children }) => {
  return (

    <SettingsProvider>
      <ProfileProvider>
        <EditUserProvider>
          <ChatContextProvider>
            <SuggestionsProvider>
              <FetchAllGroupsProvider>
                <DeleteGroupProvider>
                  <GroupProfileProvider>
                    <PostContextProvider>
                      <CommentContextProvider>
                        {children}
                      </CommentContextProvider>
                    </PostContextProvider>
                  </GroupProfileProvider>
                </DeleteGroupProvider>
              </FetchAllGroupsProvider>
            </SuggestionsProvider>
          </ChatContextProvider>
        </EditUserProvider>
      </ProfileProvider>
    </SettingsProvider>
  );
};

export default Provider;