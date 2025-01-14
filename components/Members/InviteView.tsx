import { Box, Button, Container, Heading, Stack, Text } from '@chakra-ui/react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useState } from 'react';

import LoginWrapper from '@/components/Header/LoginWrapper';
import type { User } from '@/interface/user';
import { userStore } from '@/store/user';

interface Props {
  invite: any;
}

function InviteView({ invite }: Props) {
  const router = useRouter();
  const [triggerLogin, setTriggerLogin] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isWalletError, setIsWalletError] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const { setUserInfo, userInfo } = userStore();

  const acceptUser = async (user: User) => {
    setIsAccepting(true);
    if (user?.id && user?.isVerified && user?.email !== invite?.email) {
      setIsWalletError(true);
      setIsAccepting(false);
    } else if (user?.id && user?.isVerified && user?.email === invite?.email) {
      try {
        await axios.post('/api/userSponsors/accept/', {
          inviteId: invite?.id,
          userId: user?.id,
        });
        router.push('/dashboard/bounties');
      } catch (e) {
        setIsWalletError(true);
        setIsAccepting(false);
      }
    }
  };

  const handleSubmit = () => {
    if (userInfo?.id) {
      setIsError(true);
    } else {
      setUserInfo({ email: invite?.email });
      setTriggerLogin(true);
    }
  };

  return (
    <Container maxW={'3xl'}>
      <LoginWrapper
        acceptUser={acceptUser}
        inviteInfo={{
          emailInvite: invite?.email,
          currentSponsorId: invite?.sponsorId,
          memberType: invite?.memberType,
        }}
        triggerLogin={triggerLogin}
        setTriggerLogin={setTriggerLogin}
      />
      <Stack as={Box} py={{ base: 20, md: 36 }} textAlign={'center'}>
        <Heading
          fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }}
          fontWeight={700}
          lineHeight={'110%'}
        >
          Welcome to <br />
          <Text as={'span'} color={'brand.purple'}>
            Superteam Earn
          </Text>
          !
        </Heading>
        <Text pt={2} color={'brand.slate.500'}>
          Start your journey to access top global talent!
          <br />
          <Text as="span" fontWeight={700}>
            Accept{' '}
            {`${invite?.sender?.firstName} ${invite?.sender?.lastName}'s`}{' '}
            invite to join Superteam Earn.
          </Text>
        </Text>
        <Stack
          pos={'relative'}
          align={'center'}
          direction={'column'}
          alignSelf={'center'}
          pt={4}
        >
          <Button
            px={6}
            isLoading={isAccepting}
            loadingText="Accepting Invite..."
            onClick={() => handleSubmit()}
            rounded={'full'}
            size="lg"
            variant="solid"
          >
            Accept Invite
          </Button>
        </Stack>
        {isError && (
          <Text pt={2} color={'red'}>
            You are already logged in!
            <br />
            Please log out and then click on the invite link.
          </Text>
        )}
        {isWalletError && (
          <Text pt={2} color={'red'}>
            You have already signed up using the same wallet address.
            <br />
            Please log out, change your wallet & try again.
          </Text>
        )}
      </Stack>
    </Container>
  );
}

export default InviteView;
